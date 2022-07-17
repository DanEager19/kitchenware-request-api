# Kitchenware backend API
<p>
    A simple backend service for cataloguing kitchenware items and signing up for reservations. 
    Utilizes Express, PostgreSQL, and Docker.
</p>

## Dependencies
```sh
This app requires Node.JS version 16 or later. It also uses Yarn and the Docker Engine.
```

## Installation
```sh
git clone https://github.com/DanEager19/ktichenware-request-api
cd kitchenware-request-api
yarn install
```

## Testing
```sh
yarn test
```

## Usage
For development environments:
```sh
yarn start:dev (Note: An instance of PostgreSQL on localhost is required for non-container environments.)
```
For deployment:
```sh
docker-compose up -d --build
```
## Author

**Daniel Eager**

* Website: https://deager.dev/
* Github: [@DanEager19](https://github.com/DanEager19)