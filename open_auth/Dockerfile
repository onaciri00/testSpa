# image python
FROM python:3.11 

RUN apt-get update && apt-get install -y postgresql-client

# working directory
WORKDIR /django

# copy the source (django project to container)
COPY requirment.txt .

COPY entrypoint.sh .

COPY wait_postgrey.sh .

# install dependencies pip is tool that used to install dependencies that django needs
RUN pip install --upgrade pip

# install django requirement (dependencies) by use pip 
RUN pip install -r requirment.txt

# RUN chmod +x entrypoint.sh

RUN chmod +x entrypoint.sh wait_postgrey.sh

# app will listen on 8000
EXPOSE  8000

# i will create script for this part
ENTRYPOINT ["./entrypoint.sh"]

