# Face Recognition - JavaScript

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

This project was developed with the purpose of exploring facial recognition methods using JavaScript. Although this topic is widely covered in languages like Python, it's interesting to implement this process using a different technology than usual.

When I developed this project, I wanted to understand what a minimal implementation of facial recognition would look like. For this, I used **Node.js** for creating the APIs, **Next.js** for the user interface, and **Postgres** (with the pgvector extension) as the database. To generate the image embeddings, instead of training my own model and implementing it, I used the [Human](https://github.com/vladmandic/human) library .

If you want to start understanding how facial recognition works, I recommend reading [this article](https://medium.com/@ragilprasetyo310/simple-face-recognition-with-facial-landmark-k-nearest-neighbors-ad5ae733adba).


## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Limitations and Next Steps](#limitations-and-next-steps)

## Features
- Registers a new user with a username, password, and face data.
- User login with face recognition, based on username + face data.
- Identify a user through face recognition, without any information besides face data.

## Prerequisites
Before installing, ensure you have the following installed on your system:
- **Docker**: You can download and install Docker from [here](https://www.docker.com/get-started).


## Installation

1. Clone the repository:

```bash
git clone https://github.com/valmarath/face-recognition-javascript.git
```

2. Build the application
```bash
docker-compose build --no-cache
```

3. Run the application and tests
```bash
docker-compose up -d
```
## Usage

1. The user interface will be accessible at http://localhost:3000
2. The API will be accessible at http://localhost:5001
3. The API documentation will be accessible at http://localhost:5001/api-docs

## Limitations
This project was, above all, an experiment. Therefore, the implementation and architecture are not ready for real-world use. Specifically, using facial recognition for login in a web application could introduce several security vulnerabilities, so caution should be exercised before considering its implementation.

However, the main goal of this project was exploratory, and it should be treated as such.

