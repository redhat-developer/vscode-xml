#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-12.13.1'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh "npm install -g vsce"
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

def buildLemMinXBinary() {
	sh "curl -Lo NativeImage.jenkins https://raw.githubusercontent.com/${params.FORK}/vscode-xml/${params.BRANCH}/NativeImage.jenkins"
	load "NativeImage.jenkins"
}

node('rhel7'){
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
		git url: 'https://github.com/eclipse/lemminx.git'
		sh "./mvnw clean verify -B -U -e -P!jboss-maven-repos,!redhat-ga-repository,!redhat-ea-repository"
		sh "mv org.eclipse.lemminx/target/org.eclipse.lemminx*-uber.jar ."
		files = findFiles(glob: 'org.eclipse.lemminx*-uber.jar')
	}
	stash name: 'server_distro', includes :files[0].path
}

node('rhel7'){
	stage 'Checkout vscode-xml code'
	deleteDir()
	def gitUrl = "${GIT_REPO}"

	git url: gitUrl?:'https://github.com/redhat-developer/vscode-xml.git', branch: params.BRANCH?: 'master'

	stage 'set the link to download the binary server'
	def packageJson = readJSON file: 'package.json'
	def binaryUploadFolder = 'snapshots'
	if (publishToMarketPlace.equals('true')) {
		binaryUploadFolder = 'stable'
	}
	def downloadLocation = 'https://download.jboss.org/jbosstools'
	sh "sed -i -e 's|${downloadLocation}/vscode/snapshots/lemminx-binary/LATEST|${downloadLocation}/vscode/${binaryUploadFolder}/lemminx-binary/${packageJson.version}-${env.BUILD_NUMBER}|g' package.json"

	stage 'package binary hashes'
	sh "mkdir ./server"
	sh "wget ${downloadLocation}/vscode/${binaryUploadFolder}/lemminx-binary/${packageJson.version}-${env.BUILD_NUMBER}/lemminx-linux.sha256 -O ./server/lemminx-linux.sha256"
	sh "wget ${downloadLocation}/vscode/${binaryUploadFolder}/lemminx-binary/${packageJson.version}-${env.BUILD_NUMBER}/lemminx-win32.sha256 -O ./server/lemminx-win32.sha256"
	sh "wget ${downloadLocation}/vscode/${binaryUploadFolder}/lemminx-binary/${packageJson.version}-${env.BUILD_NUMBER}/lemminx-osx-x86_64.sha256 -O ./server/lemminx-osx-x86_64.sha256"

	stage 'install vscode-xml build requirements'
	installBuildRequirements()

	stage 'Build vscode-xml'
	buildVscodeExtension()
	unstash 'server_distro'
	def files = findFiles(glob: '**/org.eclipse.lemminx*-uber.jar')
	sh "mv ${files[0].path} ./server"

	stage "Package vscode-xml"
	sh "vsce package -o vscode-xml-${packageJson.version}-${env.BUILD_NUMBER}.vsix"

	//stage 'Test vscode-xml for staging'
	//wrap([$class: 'Xvnc']) {
	//	sh "npm test --silent"
	//}

	stage 'Upload to /vscode-xml/staging'
	def vsix = findFiles(glob: '**.vsix')
	sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/vscode-xml/staging"
	stash name:'vsix', includes:vsix[0].path
}

node('rhel7'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:2, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'fbricon,rgrunber,azerr,davthomp'
		}

		stage "Publish to Marketplaces"
		unstash 'vsix'
		def vsix = findFiles(glob: '**.vsix')
		// VS Code Marketplace
		withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
			sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
		}

		// Open-vsx Marketplace
		sh "npm install -g ovsx"
		withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
			sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
		}
		archive includes:"**.vsix"

		stage "Upload to /vscode-xml/stable"
		// copy this stable build to Akamai-mirrored /static/ URL, so staging can be cleaned out more easily
		sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/static/vscode-xml/stable/"
	}// if publishToMarketPlace
}