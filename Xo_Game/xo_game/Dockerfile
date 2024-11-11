FROM python:3.11

RUN apt-get update && apt-get install -y postgresql-client

RUN pip install --upgrade pip

WORKDIR /xo_game

COPY requirements.txt .

COPY entrypoint.sh .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 8001

ENTRYPOINT ["./entrypoint.sh"]