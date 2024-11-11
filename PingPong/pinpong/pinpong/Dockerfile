FROM python:3.11


RUN apt-get update && apt-get install -y postgresql-client

RUN pip install --upgrade pip


WORKDIR /PINPONG

COPY requirements.txt .

COPY entrypoint.sh .


RUN pip install --no-cache-dir -r requirements.txt

COPY . .



RUN chmod +x entrypoint.sh

EXPOSE 8002

ENTRYPOINT ["./entrypoint.sh"]


