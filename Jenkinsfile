pipeline {
  agent any
  stages {
    stage('Checkout Code') {
      steps {
        git(url: 'https://github.com/Tabrigos/js-2d-browser-game-sidescroll_shooter', branch: 'main')
      }
    }

    stage('') {
      steps {
        sh 'ls -la'
      }
    }

  }
}