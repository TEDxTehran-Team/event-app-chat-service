# TEDxTehran - Event Application Chat

![](https://upload.wikimedia.org/wikipedia/commons/b/b9/TEDxTehran.png)

![](https://img.shields.io/github/stars/TEDxTehran-Team/event-app-core) ![](https://img.shields.io/github/forks/TEDxTehran-Team/event-app-core) ![](https://img.shields.io/github/issues/TEDxTehran-Team/event-app-core)

## About
> Supporting the mission of Ideas Worth spreading, TEDxTehran are local, independently organized events licensed by TED that brings people living in Tehran together to share a TED-like experience. We bring thought leaders, innovators and doers, from across different disciplines, to share their ideas and stories in the heart of Tehran. In the spirit of TED’s “Ideas Worth Spreading” we strive to bring "Make Iran Famous for its Ideas".

This is the repository hosting the code for **Mathmaking chat based on Node.js & MongoDB**, free for use by anyone.

## Requirements
- Docker (version 19.03.0 or later)
- Docker compose

## Deploy
- Clone the repo:
`git clone git@github.com:TEDxTehran-Team/event-app-chat-service.git`
- Copy .env.example to .env
- Add secret key and other data to the env files
- Run these commands:
```shell
docker-compose up
docker-compose exec app python manage.py migrate
```

## Documentation

After deploying, you can see the docs at here: http://localhost:3030/api-docs

## Contributing
Feel free to submit any pull request that improves this project in any possible way. Before undertaking a major change, consider opening an issue for some discussion.

## Other Open-Source Projects
- [App core backend](https://github.com/TEDxTehran-Team/event-app-core.git)
- [iOS application](https://github.com/TEDxTehran-Team/event-app-ios)
- [Android application](https://github.com/TEDxTehran-Team/event-app-andoid)