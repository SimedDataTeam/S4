#!/bin/bash

docker build --progress=plain --tag temporary .

# docker run -it --rm temporary ash
docker run -it --rm \
  --publish 3000:3000 \
  --env SNOWSTORM_SERVER=https://browser.ihtsdotools.org/snowstorm/snomed-ct \
  temporary
