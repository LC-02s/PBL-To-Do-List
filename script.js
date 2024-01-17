const listInput = document.getElementById('listInput');
const listContainer = document.getElementById('listContainer');
const listLengthTxt = document.getElementById('listLengthTxt');
const listClearBtn = document.getElementById('clearBtn');

function listTemplate(state, item) {
    if (state) {
        return `
            <li class="area-main__ctsItem ${item.state ? '' : 'area-main__ctsItem--checked'}" role="listitem" data-index="${item.index}">
                <div class="area-main__ctsItemLeft">
                    <label class="area-main__ctsItemChk" tabIndex="0">
                        <input type="checkbox" ${item.state ? '' : 'checked'}>
                        <svg viewBox="0 0 64 64" height="2em" width="2em">
                            <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
                        </svg>
                    </label>
                    <h3 class="area-main__ctsItemTitle">${item.title ?? 'list title'}</h3>
                </div>
                <div class="area-main__ctsItemRight">
                    <p class="area-main__ctsItemTime">${item.time ?? 'created time'}</p>
                    <button class="area-main__ctsItemDelete" type="button" role="button"><span class="material-icons">delete</span></button>
                </div>
            </li>
            `;
    } else return `<li class="area-main__ctsNone"><p>할 일이 없습니다</p></li>`;    
}

function loadList() {
    const activeListArr = JSON.parse(window.localStorage.getItem('activeList')) ?? [];
    const passiveListArr = JSON.parse(window.localStorage.getItem('passiveList')) ?? [];

    listContainer.innerHTML = `<div class="area-main__ctsLoaderBox"><div class="area-main__ctsLoader"></div></div>`;

    function uiEventBinding() {
        const deleteBtns = listContainer.querySelectorAll(".area-main__ctsItemDelete");
        const checkBoxs = listContainer.querySelectorAll('input[type="checkbox"]');
        const checkLabels = listContainer.querySelectorAll(".area-main__ctsItemChk");
        deleteBtns.forEach(el => el.addEventListener('click', deleteList));
        checkBoxs.forEach(el => el.addEventListener('change', changeListState));
        checkLabels.forEach(el => el.addEventListener('keydown', (e) => {
            if (e.keyCode == 13) el.children[0].click();
        }));
    }

    if (activeListArr.length !== 0) {
        listContainer.innerHTML = '';
        [...activeListArr].reverse().forEach(el => listContainer.innerHTML += listTemplate(1, el));
        if (passiveListArr.length !== 0) {
            [...passiveListArr].reverse().forEach(el => listContainer.innerHTML += listTemplate(1, el));
        }
        uiEventBinding();
    } else {
        if (passiveListArr.length !== 0) {
            listContainer.innerHTML = '';
            [...passiveListArr].reverse().forEach(el => listContainer.innerHTML += listTemplate(1, el));
            uiEventBinding();
        } else listContainer.innerHTML = listTemplate(0);
    }
    listLengthTxt.textContent = activeListArr.length;
}
loadList();

function addList() {
    if (listInput.value) {
        const activeListArr = JSON.parse(window.localStorage.getItem('activeList')) ?? [];
        const listItemObj = {};
        const timeFormatOpt = { month: '2-digit', day: '2-digit', weekday: 'short', hourCycle: 'h24', hour: '2-digit', minute: '2-digit' };
        
        listItemObj.state = true;
        listItemObj.index = activeListArr.length;
        listItemObj.title = listInput.value;
        listItemObj.indexTime = new Date();
        listItemObj.time = new Intl.DateTimeFormat('ko-KR', timeFormatOpt).format(listItemObj.indexTime);

        window.localStorage.setItem('activeList', JSON.stringify([...activeListArr, listItemObj]));
        loadList();
        listInput.value = '';
    } else alert('이름을 입력해주세요');
}

function deleteList(e) {
    const targetItem = this.parentNode.parentNode;
    const itemState = targetItem.classList.contains('area-main__ctsItem--checked');
    const targetStorageKey = itemState ? 'passiveList' : 'activeList';
    const readListArr = JSON.parse(window.localStorage.getItem(targetStorageKey));
    const targetListArr = [...readListArr];
    const itemIdx = Number(targetItem.dataset.index);
    
    targetListArr.splice(itemIdx, 1);
    targetListArr.forEach((el, idx) => el.index = idx);
    window.localStorage.setItem(targetStorageKey, JSON.stringify(targetListArr));
    loadList();
}

function changeListState(e) {
    // 모든 체크박스 요소 비활성화
    listContainer
        .querySelectorAll('input[type="checkbox"]')
        .forEach(checkEl => checkEl.disabled = true);

    setTimeout(() => {
        const targetItem = this.parentNode.parentNode.parentNode;
        const isChecked = this.checked; // true : 리스트 내림, false : 다시 올림
        const itemIdx = Number(targetItem.dataset.index);
    
        // 함수를 실행한 아이템이 속한 배열 추출
        const changeStorageKey = isChecked ? 'activeList' : 'passiveList';
        const readChangeListArr = JSON.parse(window.localStorage.getItem(changeStorageKey)) ?? [];
        const changeListArr = [...readChangeListArr];
    
        // 함수를 실행한 아이템을 추출 후 넣을 배열
        const targetStorageKey = isChecked ? 'passiveList' : 'activeList';
        const readTargetListArr = JSON.parse(window.localStorage.getItem(targetStorageKey)) ?? [];
        const targetListArr = [...readTargetListArr];
    
        // 함수를 실행한 아이템 추출 & 상태 변경 & 새 배열에 추가
        const changeItem = changeListArr.splice(itemIdx, 1);
        changeItem[0].state = !changeItem[0].state;
        targetListArr.push(changeItem[0]);
    
        // 새로운 배열 개수가 1개 이상일 시 시간 순 정렬 & 인덱스 초기화 & 배열 저장
        if (targetListArr.length > 1) targetListArr.sort((a, b) => new Date(a.indexTime) - new Date(b.indexTime));
        targetListArr.forEach((el, idx) => el.index = idx);
        window.localStorage.setItem(targetStorageKey, JSON.stringify(targetListArr));
    
        // 기존 배열 인덱스 정렬 및 저장
        changeListArr.forEach((el, idx) => el.index = idx);
        window.localStorage.setItem(changeStorageKey, JSON.stringify(changeListArr));
        loadList();
    }, 500);
}

function clearList() {
    const alertTxt = '초기화 시 할 일 목록이 모두 삭제되며, \n다시는 복구할 수 없습니다 \n초기화 하시겠습니까?';
    if (confirm(alertTxt)) {
        window.localStorage.setItem('activeList', '[]');
        window.localStorage.setItem('passiveList', '[]');
        loadList();
    }
}

window.addEventListener('keydown', (e) => {
    const hotKey = window.navigator.platform.toLowerCase().indexOf('mac') >= 0 ? e.metaKey : e.altKey;
    if (hotKey && e.keyCode == 13) listInput.focus();
});
listInput.addEventListener('keydown', (e) => {
    if (e.keyCode == 13) addList();
    else if (e.keyCode == 27) listInput.blur();

    if (listInput.value !== '') {
        listInput.parentNode.classList.remove('area-main__inputBox--tooltip');
    }
});
listInput.addEventListener('focus', (e) => {
    if (Number(listLengthTxt.textContent) <= 0 && listInput.value === '') {
        listInput.parentNode.classList.add('area-main__inputBox--tooltip');
    }
});
listInput.addEventListener('blur', (e) => {
    listInput.parentNode.classList.remove('area-main__inputBox--tooltip');
});
listClearBtn.addEventListener('click', clearList);