#
# Copyright 2021 Bundesreplublik Deutschland
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

RED='\033[0;31m'
RESET='\033[0m'

printf "${RED}***********************************************************${RESET}\n"
printf "${RED}THIS COMMAND SHOULD NEVER BE USED IN YOUR LOCAL ENVIRONMENT${RESET}\n"
printf "${RED}***********************************************************${RESET}\n"

docker build -t hotel-ui .

docker run --name hotel-ui -d --rm -ti -p 3005:80 hotel-ui
