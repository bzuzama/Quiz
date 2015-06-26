#!/bin/sh
mkdir certs
cd certs
openssl genrsa -out bz-quiz-2015-key.pem
openssl req -new -sha256 -key bz-quiz-2015-key.pem -out bz-quiz-2015-csr.pem
openssl x509 -req -in bz-quiz-2015-csr.pem -signkey bz-quiz-2015-key.pem -out bz-quiz-2015-cert.pem
