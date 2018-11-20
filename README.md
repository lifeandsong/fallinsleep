# 잠재우기 

## 1. 개요
* “잠재우기”는 쉽게 잠이 못드는 어린이들을 재워주는 Naver Custom Extension Skill 입니다.


## 2. 사용 예

2.1. 최초 발화 : (사용자) 헤이, 클로바! 잠재우기 시작해줘

2.2. 사용자는 ‘별’, ‘양’, ‘곰’ 등 세 친구 중 1개를 고르게 됩니다 : (사용자) 양이 좋아

2.3. 클로바와 사용자는 번갈아 가면서 수를 셉니다 : (클로바) 양 한마리 (사용자) 양 두마리 …

2.4. 사용자가 답변이 없거나 잘못된 수를 얘기하면 클로바는 계속 할지 물어봅니다
* (클로바) 자니?
* (사용자) 아니 (클로바) 그럼 계속 할게. 양 여덟마리 (사용자) 양 아홉마리 …
* (사용자) 응 (클로바) 잘 자

2.5. 클로바와 사용자가 100까지 숫자를 세면, 클로바는 인사를 하고 마칩니다.
* (사용자) 곰 백마리
* (클로바) 나 이제 졸려서 그만 잘게. 너도 잘 자.


## 3. Intent, Reprompt & Entity
* Clova Developer's Console(https://developers.naver.com/console/clova/) Intent, Entity 등록을 해야 합니다.

3.1. SelectFriend : 사용자가 수를 셀 친구를 선택하면 이를 처리하는 Intent
* friend : 별, 양, 곰

3.2. StarAnswer : 사용자가 별을 세는 수를 받고 답변을 하는 Intent 
* starCount : 하나, 둘, 셋, … , 아흔아홉, 백

3.3. SheepAnswer, BearAnswer : 사용자가 양, 곰을 세는 수를 받고 답변을 하는 Intent
* animalCount : 한, 두, 세, … , 아흔아홉, 백

3.4. Repromt : StarAnswer, SheepAnswer Intent에서 사용자가 답변을 하지 않으면 “자니?”라고 물음

3.5. Sleeping : 사용자가 클로바의 “자니?”라는 질문에 답변을 받고 이를 처리하는 Intent 
* yesno : 응, 아니, 자려고, …


## 4. 개발

4.1. 개발 언어 : Javascript NodeJS v6 

4.2. 서버 : Naver Cloud Platform의 Cloud Functions
* 클로바와 JSON 데이터로 송수신만 하면 됨
* HTTPS로 통신하도록 URL 제공
* 2018.11.20. 현재 사용료 무료 

4.3. 프로그램 명세
* make_entity_data.js : starCount, animalCount Entity로 등록할 데이터를 담은 .txt 파일을 생성하는 프로그램 
* index.js : Clova와 연동할 Webhook 프로그램

4.4. 참고자료
* index.js 는 Clova의 Extension 예제 중 https://github.com/naver/clova-extension-sample-dice 를 참고했고 주요 코드를 그대로 사용함


## 5. 외부 리소스

5.1. 자장가 음원 : archieve.org에 공개된 자장가 음악를 맨 마지막에 들려줍니다.
