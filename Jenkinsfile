#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-14.19.1'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh 'npm install -g --force "@vscode/vsce"'
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

def buildLemMinXBinary() {
	sh "curl -Lo NativeImage.jenkins https://raw.githubusercontent.com/${params.FORK}/vscode-xml/${params.BRANCH}/NativeImage.jenkins"
	load "NativeImage.jenkins"
}

node('rhel8'){
	sh "curl -Lo package.json https://raw.githubusercontent.com/${params.FORK}/vscode-xml/${params.BRANCH}/package.json"
	def packageJson = readJSON file: 'package.json'
	def serverVersion = packageJson?.xmlServer?.version
	def files = []
	if (serverVersion && publishToMarketPlace.equals('true')) {
		stage 'Download XML LS'
		def serverUrl = "https://repo.eclipse.org/content/repositories/lemminx-releases/org/eclipse/lemminx/org.eclipse.lemminx/${serverVersion}/org.eclipse.lemminx-${serverVersion}-uber.jar"
		sh "curl -Lo org.eclipse.lemminx-${serverVersion}-uber.jar ${serverUrl}"
		files = findFiles(glob: 'org.eclipse.lemminx*-uber.jar')
	}

	buildLemMinXBinary()

	if (!files[0]) {
		stage 'Build XML LS'
		git url: 'https://github.com/eclipse/lemminx.git', branch: 'main'
		sh "./mvnw clean verify -B -U -e -P!jboss-maven-repos,!redhat-ga-repository,!redhat-ea-repository"
		sh "mv org.eclipse.lemminx/target/org.eclipse.lemminx*-uber.jar ."
		files = findFiles(glob: 'org.eclipse.lemminx*-uber.jar')
	}
	stash name: 'server_distro', includes :files[0].path
}

node('rhel8'){
	stage 'Checkout vscode-xml code'
	deleteDir()
	def gitUrl = "${GIT_REPO}"

	git url: gitUrl?:'https://github.com/redhat-developer/vscode-xml.git', branch: params.BRANCH?: 'main'

	stage 'set the link to download the binary server'
	def packageJson = readJSON file: 'package.json'
	def binaryUploadFolder = 'latest'
	def downloadLocation = 'https://github.com/redhat-developer/vscode-xml'
	if (publishToMarketPlace.equals('true')) {
		sh "sed -i -e 's|${downloadLocation}/releases/download/latest|${downloadLocation}/releases/download/${packageJson.version}|g' package.json"
	}

	stage 'install vscode-xml build requirements'
	installBuildRequirements()

	stage 'Build vscode-xml'
	buildVscodeExtension()
	unstash 'server_distro'
	def files = findFiles(glob: '**/org.eclipse.lemminx*-uber.jar')
	sh "mkdir ./server"
	sh "mv ${files[0].path} ./server"

	env.publishPreReleaseFlag = ""
	if(publishPreRelease.equals('true')){
		stage "Prepare for pre-release"
		sh "npx gulp prepare_pre_release"
		packageJson = readJSON file: 'package.json'
		env.publishPreReleaseFlag = "--pre-release"
	}

	stage "Package vscode-xml"
	sh "mkdir ../staging"
	unstash 'binaries'
	unstash 'checksums'
	sh "mv lemminx-* ../staging"
	def platformToTarget = [ "linux-x64" : "linux", "win32-x64" : "win32", "darwin-x64" : "osx-x86_64", "darwin-arm64" : "osx-x86_64"]
	for(entry in platformToTarget){
		def target = entry.key
		def platform = entry.value
		sh "unzip -d ./server ../staging/lemminx-${platform}.zip"
		sh "cp ../staging/lemminx-${platform}.sha256 ./server"
		sh "vsce package ${env.publishPreReleaseFlag} --target ${target} -o vscode-xml-${target}-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
		sh "rm ./server/lemminx-*"
	}
	// This vsix only gets published to OpenVSX (if option is set)
	// server folder still needed to publish generic vsix below
	sh "cp ../staging/lemminx-*.sha256 ./server"
	sh "vsce package -o vscode-xml-${packageJson.version}-${env.BUILD_NUMBER}.vsix"

	//stage 'Test vscode-xml for staging'
	//wrap([$class: 'Xvnc']) {
	//	sh "npm test --silent"
	//}

	stage 'Archive artifacts'
	archiveArtifacts artifacts: '*.vsix'
	stash name:'vsix', includes:'*.vsix'
}

node('rhel8'){
	sh 'npm install -g --force "@vscode/vsce"'
	sh 'npm install -g "ovsx"'
	if(publishToMarketPlace.equals('true') || publishPreRelease.equals('true')){

		if (publishToMarketPlace.equals('true')) {
			timeout(time:2, unit:'DAYS') {
				input message:'Approve deployment?', submitter: 'fbricon,rgrunber,azerr,davthomp'
			}
		}

		stage "Publish to Marketplaces"
		unstash 'vsix'
		def vsix = findFiles(glob: '**.vsix')
		// VS Code Marketplace
		withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
			def platformVsixes = findFiles(glob: '**.vsix', excludes: vsix[0].path)
			for(platformVsix in platformVsixes){
				sh 'vsce publish -p ${TOKEN}' + " --packagePath ${platformVsix.path}"
			}
			// Cannot combine packagePath & target, so re-generate (generic) package and publish
			sh 'vsce publish -p ${TOKEN} --target win32-ia32 win32-arm64 linux-arm64 linux-armhf alpine-x64 alpine-arm64' + " ${env.publishPreReleaseFlag}"
		}

		if (publishToMarketPlace.equals('true')) {
			// Open-VSX Marketplace does not support pre-release
			withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
				sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
			}
		}

	}// if publishToMarketPlace
}
