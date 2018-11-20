/**
 * "잠재우기" for Naver Clova
 * on Naver Cloud Platform
 * 
 * @since  2018-11-04
 * @author lifeandsong
 */

const uuid = require('uuid').v4
const _ = require('lodash')
// const { DOMAIN } = require('../config')

// class Directive {
//   constructor({namespace, name, payload}) {
//     this.header = {
//       messageId: uuid(),
//       namespace: namespace,
//       name: name
//     }
//     this.payload = payload
//   }
// }

class NumberConverter {
    constructor () {
        this.multiple10List = [ "", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔" ]
        this.zeroToNineList = [
            [ "", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉" ],
            [ "", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉" ]
        ]
    }

    getNumber(str, ary, multipleNo) {
        let count = ary.length
        for (let i=0; i<count; i++) {
            if (ary[i] == "")
                continue
    
            if (str.replace(ary[i], "") != str)
                return i * multipleNo
        }
        return 0
    }
    
    textToNumber(str, zeroToNineIdx) {
        if (str == "백")
            return 100
        
        let ten = this.getNumber(str, this.multiple10List, 10)
        let one = this.getNumber(str, this.zeroToNineList[zeroToNineIdx], 1)
        return ten + one
    }
    
    numberToText(number, zeroToNineIdx) {
        if (Math.floor(number / 100) >= 1)
            return "백"
        
        let one = number % 10
        let ten = Math.floor(number / 10)
        return this.multiple10List[ten] + this.zeroToNineList[zeroToNineIdx][one]
    }
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    const WELCOME_MESSAGE = "\
안녕! \
나는 너를 코오오 재워줄 '잠재우기'야. \
먼저, 함께 잠이 들 친구를 골라야 해. \
별, 양, 곰, 중 누가 좋니? 음, '양이 좋아'처럼 말하면 돼.\
    "
    cekResponse.setSimpleSpeechText(WELCOME_MESSAGE)
    cekResponse.setMultiturn({ })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    console.log("intent=" + intent)
    const slots = this.request.intent.slots
    const numberConverter = new NumberConverter()
    const ANSWER_COUNT_THRESHOLD = 100
    const answerValues = {
        "StarAnswer": {
            "friend": "별",
            "unit": "",
            "zeroToNineIdx": 0
        },
        "SheepAnswer": {
            "friend": "양",
            "unit": "마리",
            "zeroToNineIdx": 1
        },
        "BearAnswer": {
            "friend": "곰",
            "unit": "마리",
            "zeroToNineIdx": 1
        }
    }

    let friend = ""
    let intentName = ""
    let count = 2
    if ((!! this.session) && (!! this.session.sessionAttributes)) {
        if (!! this.session.sessionAttributes.intent)
            intentName = this.session.sessionAttributes.intent

        if (!! this.session.sessionAttributes.count)
            count = this.session.sessionAttributes.count

        if (!! this.session.sessionAttributes.friend)
            friend = this.session.sessionAttributes.friend
    }

    let script = ""
    switch (intent) {
        case 'SelectFriend':
            // Answer 도중에 Clova가 잘못 인식하여 여기로 올 경우, Answer Intent로 돌려야 함
            if ((!! this.session)
                && (!! this.session.sessionAttributes)
                && (!! this.session.sessionAttributes.count)) {
                // count = this.session.sessionAttributes.count

                // if (!! this.session.sessionAttributes.friend)
                //     friend = this.session.sessionAttributes.friend
        
                intentName = this.getIntentByFriend(friend, answerValues)
                cekResponse.appendSpeechText("자니?")
                this.setMultiturnSessionAttributes(cekResponse, intentName, friend, count)
                break
            }

            friend = "별"
            if ((!! slots) && (!! slots.friend))
                friend = slots.friend.value

            console.log("friend=" + friend)
            switch (friend) {
                case "양":
                case "별":
                case "곰":
                    let firstTurn = this.getAnswerByFriend(numberConverter, 1, friend, answerValues)
                    let secondTurn = this.getAnswerByFriend(numberConverter, 2, friend, answerValues)
                    script = "오, 멋진 선택이야."
                                + " 내가, " + firstTurn + ", 하면, 네가, " + secondTurn + ", 하는거야."
                                + " 그러다가 졸리면 스르르 자면돼."
                                + " 자, 그럼 눈을 감고. 나부터 할게. "
                                + firstTurn + "."
                    cekResponse.appendSpeechText(script)

                    let answerCount = Object.keys(answerValues).length
                    for(let i=0; i<answerCount; i++) {
                        if (answerValues[Object.keys(answerValues)[i]]["friend"] == friend) {
                            intentName = Object.keys(answerValues)[i]
                            break
                        }
                    }
                    this.setMultiturnSessionAttributes(cekResponse, intentName, friend, 2)
                    break

                default:
                    cekResponse.setSimpleSpeechText("음, 다시 한번 말해줄래? '나는 곰이 좋아'처럼 말하면 돼.")
                    cekResponse.setMultiturn({ })
            }
            break

    case 'StarAnswer':
    case 'SheepAnswer':
    case 'BearAnswer':
        // 사용자의 답변 
        let answer = numberConverter.numberToText(2, answerValues[intent]["zeroToNineIdx"])
        if ((!! slots) && (!! slots.answer))
            answer = slots.answer.value

        console.log("answer=" + answer)
        // if ((!! this.session) && (!! this.session.sessionAttributes)) {
        //     if (!! this.session.sessionAttributes.count)
        //         count = this.session.sessionAttributes.count

        //     if (!! this.session.sessionAttributes.friend)
        //         friend = this.session.sessionAttributes.friend
        // }
        console.log("friend=" + answerValues[intent]["friend"] + ", count=" + count)

        let userCount = numberConverter.textToNumber(answer, answerValues[intent]["zeroToNineIdx"])
        console.log("StarAnswer: userCount=" + userCount)

        // 사용자의 답변이 ANSWER_COUNT_THRESHOLD(100) 이상이면 종료한다.
        if (userCount >= ANSWER_COUNT_THRESHOLD) {
            this.stopAndSleep(cekResponse, "나 이제 졸려서 그만 잘게. 너도 잘 자.")
            break
        }

        // 스피커의 답변
        count = count + 1
        script = this.getAnswerByIntent(numberConverter, count, intent, answerValues)
        cekResponse.appendSpeechText(script)

        // 사용자 답변이 없을 때
        cekResponse.setRepromptText("자니?")

        // 사용자가 말할 숫자를 세션에 저장 
        count = count + 1
        this.setMultiturnSessionAttributes(cekResponse, intent, friend, count)
        break

    case 'Sleeping':
        let yesno = "응"
        if ((!! slots) && (!! slots.yesno))
            yesno = slots.yesno.value

        console.log("yesno=" + yesno)
        if (yesno != "응") {
            // if ((!! this.session) && (!! this.session.sessionAttributes)) {
            //     if (!! this.session.sessionAttributes.intent)
            //         intentName = this.session.sessionAttributes.intent

            //     if (!! this.session.sessionAttributes.count)
            //         count = this.session.sessionAttributes.count

            //     if (!! this.session.sessionAttributes.friend)
            //         friend = this.session.sessionAttributes.friend
            // }

            script = "응, 그럼 내가 계속 할게. "
                        + this.getAnswerByIntent(numberConverter, count, intentName, answerValues)
            cekResponse.appendSpeechText(script)
    
            // 사용자 답변이 없을 때
            cekResponse.setRepromptText("자니?")
    
            // 사용자가 말할 숫자를 세션에 저장 
            count = count + 1
            this.setMultiturnSessionAttributes(cekResponse, intentName, friend, count)
            break

        } else
            this.stopAndSleep(cekResponse, "잘 자.")

        break

    case 'Clova.GuideIntent':

    default:
        console.log("IntentRequst: default")
        cekResponse.setSimpleSpeechText("자니?")
        // if ((!! this.session) && (!! this.session.sessionAttributes)) {
        //     if (!! this.session.sessionAttributes.intent)
        //         intentName = this.session.sessionAttributes.intent

        //     if (!! this.session.sessionAttributes.count)
        //         count = this.session.sessionAttributes.count

        //     if (!! this.session.sessionAttributes.friend)
        //         friend = this.session.sessionAttributes.friend
        // }
        this.setMultiturnSessionAttributes(cekResponse, intentName, friend, count)
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('잘 자.')
    cekResponse.clearMultiturn()
  }

  setMultiturnSessionAttributes(cekResponse, intent, friend, count) {
    let sessionAttributes = {
        "intent": intent,
        "friend": friend,
        "count": count
    }
    console.log("sessionAttributes=" + JSON.stringify(sessionAttributes))
    cekResponse.setMultiturn(sessionAttributes)
  }

  stopAndSleep(cekResponse, script) {
    cekResponse.appendSpeechText(script)
    cekResponse.appendSpeechText({
        "type": "URL",
        "lang": "",
        "value": "https://archive.org/download/BabyGoesToSleepMutionNurturingRelaxationsicForRelaxa/BACRAHMS%20LULLABY%20for%20Baby%20-%20Bedtime%20music%20-%20Lullaby%20-%20Baby%20sleeping%20music.mp3"
    })
    cekResponse.clearMultiturn()
  }

  getAnswerByIntent(converter, number, intentName, ary) {
    return ary[intentName]["friend"]
            + " "
            + converter.numberToText(number, ary[intentName]["zeroToNineIdx"])
            + ary[intentName]["unit"]
  }

  getIntentByFriend(friend, ary) {
    let intentName = ""
    let aryCount = Object.keys(ary).length
    for (let i=0; i<aryCount; i++) {
        let key = Object.keys(ary)[i]
        if (ary[key]["friend"] == friend) {
            intentName = key
            break
        }
    }
    return intentName
  }

  getAnswerByFriend(converter, number, friend, ary) {
    let intentName = this.getIntentByFriend(friend, ary)
    return this.getAnswerByIntent(converter, number, intentName, ary)
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },
    }
  }

  setRepromptText(repromptText) {
    this.response.reprompt = {
        "outputSpeech": {
            "type": "SimpleSpeech",
            "values": {
                "type": "PlainText",
                "lang": "ko",
                "value": repromptText
            }
        }
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

function main(params) {
    const httpReq = { "body": params }
    cekResponse = new CEKResponse()
    cekRequest = new CEKRequest(httpReq)
    cekRequest.do(cekResponse)
    console.log('CEKResponse: ' + JSON.stringify(cekResponse))
    return cekResponse
}
