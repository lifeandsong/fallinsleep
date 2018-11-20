/**
 * "잠재우기" Entity 데이터 생성
 * - .tsv 파일 생성
 * 
 * @since  2018-11-04
 * @author lifeandsong
 */

var fs = require('fs');

const zeroToNineList = [
    [ "", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉" ],
    [ "", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉" ]
];
const multiple10List = [ "", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔" ];

const slotValues = {

    // 양 한마리, 양 두마리, 양 세마리, ...
    // 곰 한마리, 곰 두마리, 곰 세마리, ...
    "animal": {
        "filePath": "./data/animalCount.tsv",
        "multiple10": multiple10List,
        "zeroToNine": zeroToNineList[0]
    },

    // 별 하나, 별 둘, 별 셋, ...
    "star": {
        "filePath": "./data/starCount.tsv",
        "multiple10": multiple10List,
        "zeroToNine": zeroToNineList[1]
    }
};

// 파일에 저장
function saveToFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, data, "utf-8");
        console.log("Succeed to save to " + filePath);
    } catch(e) {
        console.log(e.message);
    }
}

// slot 목록을 만듦
function makeSlotData(multiple10, zeroToNine) {
    let multiple10Count = multiple10.length;
    let zeroToNineCount = zeroToNine.length;
    let slotData = "";
    for (let i=0; i<multiple10Count; i++) {
        for (let j=0; j<zeroToNineCount; j++) {
            let numberStr = multiple10[i] + zeroToNine[j];
            if (numberStr == "")
                continue;

            slotData = slotData + multiple10[i] + zeroToNine[j] + "\n";
        }
    }
    slotData = slotData + "백\n";
    return slotData;
}

// Slot 데이터를 구함
let slotCount = Object.keys(slotValues).length;
for (let i=0; i<slotCount; i++) {
    let slot = slotValues[Object.keys(slotValues)[i]];
    let slotData = makeSlotData(slot["multiple10"], slot["zeroToNine"]);
    saveToFile(slot["filePath"], slotData);
}
