pipeline {
  agent {
    docker {
      image 'node:18-alpine'
      args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

  options {
    timeout(time: 10, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME  = 'kijanikiosk-payments'
    BUILD_DIR = 'dist'
    NEXUS_URL = 'http://host.docker.internal:8081/repository/npm-kijanikiosk/'
    NODE_ENV  = 'test'
  }

  stages {

    stage('Lint') {
      steps {
        sh 'node --check src/index.js && echo "Lint passed"'
      }
    }

    stage('Build') {
      steps {
        sh 'mkdir -p dist && cp -r src/* dist/'
        sh '''
          set -e
          test -d dist || { echo "ERROR: build output missing"; exit 1; }
          echo "Build confirmed: $(ls dist | wc -l) files"
        '''
      }
    }

    stage('Verify') {
      parallel {
        stage('Test') {
          steps {
            sh 'node --test test/index.test.js'
          }
        }
        stage('Security Audit') {
          steps {
            sh 'npm audit --audit-level=high || true'
          }
        }
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: 'dist/**',
                         fingerprint: true,
                         onlyIfSuccessful: true
      }
    }

    stage('Publish') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'Nexus-Credentials',
          usernameVariable: 'NEXUS_USER',
          passwordVariable: 'NEXUS_PASS'
        )]) {
          sh '''
            set -e
            PKG_VERSION=$(node -p "require('./package.json').version")
            GIT_SHORT=$(echo $GIT_COMMIT | cut -c1-7)
            ARTIFACT_VERSION="${PKG_VERSION}-${GIT_SHORT}"
            echo "Publishing version: ${ARTIFACT_VERSION}"
            npm version ${ARTIFACT_VERSION} --no-git-tag-version

            # Write .npmrc with correct Nexus auth format
            NEXUS_HOST="host.docker.internal:8081"
            echo "//host.docker.internal:8081/repository/npm-kijanikiosk/:username=${NEXUS_USER}" > .npmrc
            echo "//host.docker.internal:8081/repository/npm-kijanikiosk/:_password=$(echo -n ${NEXUS_PASS} | base64)" >> .npmrc
            echo "//host.docker.internal:8081/repository/npm-kijanikiosk/:email=admin@kijanikiosk.dev" >> .npmrc
            echo "always-auth=true" >> .npmrc

            npm publish --registry=${NEXUS_URL}
            rm -f .npmrc
          '''
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo "Pipeline succeeded. Artifact published to Nexus."
    }
    failure {
      echo "Pipeline FAILED on build #${env.BUILD_NUMBER}"
    }
    changed {
      echo "Pipeline status changed to ${currentBuild.currentResult}"
    }
  }
}
