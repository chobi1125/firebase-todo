let $ = (e) => document.getElementById(e);
let l = (e) => console.log(e);
let el = (e) => document.createElement(e);
let result = $("result");
let addBtn = $("addBtn");
let addTodo = $("addTodo");
let db = firebase.database();
let allDB = [];
let objDB = [];
let user, delID, message;
let lastID = 0;
let delayID = 0;
let userPhoto = $("userPhoto");
let userName = $("userName");
let loginBtn = $("loginBtn");
let logoutBtn = $("logoutBtn");
let main = $("main");

// firebase接続
let async = () =>{
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if ( firebase.auth().currentUser !== null){
        resolve("firebase接続成功")
      } else {
        reject("firebase接続失敗(未ログインの可能性あり)")
      }
    }, 2000)
  })
}
async().then(
  response => {
    db.ref(`/users/${firebase.auth().currentUser.uid}`).on('value', (snap) => {
      allDB = snap.val()
      if (allDB !== null ){
        await();
      } else {
        allDB = []; // 空だとnullになる。追記しないとawaitでエラーがでる。
        await();
      }
    });
  }).catch(
  error => {
    console.log(error);
})
// firebase接続完了後の処理まとめ
let await = () => {
  console.log("firebase接続完了");
  userFC();
  listFC();
};
// ログイン中の場合ユーザー名と写真を表示
let userFC = () => {
  if( firebase.auth().currentUser != null){
    main.style = undefined;
    loginBtn.disabled = true;
    logoutBtn.disabled = false;
    user = firebase.auth().currentUser;
    userName.textContent = `ログインユーザー名：${user.displayName}`;
    // userPhoto.src = user.photoURL;
    userPhoto.src = 'https://lh4.googleusercontent.com/-F4BlrVyQVNc/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucnnkvNSOT3A3H3UHFHwEBledVS67g/photo.jpg';
    userPhoto.style = "border-radius: 50%;width: 34px;";
  }
}
// エンターキーで追加
let enter = () => {
  addTodo.onkeypress = (e) => {
    const key = e.keyCode || e.charCode || 0;
    // 13はEnterキーのキーコード
    if (key == 13) {
      addFB();
    }
  };
};
// Firebaseへの追加
let addFB = () => {
  delayID = Number(lastID) +1 ;
  db.ref(`/users/${firebase.auth().currentUser.uid}/${delayID}`).set({
    id:delayID,
    todo:addTodo.value
  });
  addTodo.value = "";
}
// リスト一覧生成&追加生成
let listFC = () => {
  console.log("listFC")
  // 削除時の場合
  if (message === "削除" || message === "更新") {
    console.log(message);
  // 最初の一覧取得※objの場合
  } else if(Array.isArray(allDB) === false && lastID === 0){
    let objDB =Object.keys(allDB);
    l("mkobjElem1")
    mkObjElem(objDB); 
  // // 最初の一覧取得※arrayの場合
  } else if(allDB != [] && lastID === 0){
    console.log("mkArrElem");
    mkArrElem(); 
  // 追加時 not 削除時
  } else if ( lastID +1 === delayID){
    console.log("mkAddElem");
    mkAddElem();
  // データが空の場合
  } else if (allDB === []) {
    console.log("DB empty");
  // obj状態でデータ追加時データが追加されるように。
  } else if(allDB[delayID].id !== undefined){
    mkAddElem();
  } else {
    console.log("DB updated");
  }
}

let mkObjElem = (obj) => {
  obj.map((value) => {
    lastID = (value);
    let div = el('div');
    div.id = allDB[value].id;
    result.appendChild(div);
    let input = el('input');
    input.value = allDB[value].todo;
    div.appendChild(input);
    let delBtn = el('button');
    delBtn.textContent = "削除";
    delBtn.onclick = "click()";
    div.appendChild(delBtn);
    let editBtn = el('button');
    editBtn.textContent = "更新";
    div.appendChild(editBtn);
  });
}

let mkArrElem = () => {
  allDB.map((value) => {
    lastID = (value.id);
    let div = el('div');
    div.id = value.id;
    result.appendChild(div);
    let input = el('input');
    input.value = value.todo;
    div.appendChild(input);
    let delBtn = el('button');
    delBtn.textContent = "削除";
    delBtn.onclick = "click()";
    div.appendChild(delBtn);
    let editBtn = el('button');
    editBtn.textContent = "更新";
    div.appendChild(editBtn);
  });
}

let mkAddElem = () => {
  lastID = allDB[delayID].id;
  let div = el('div');
  div.id = allDB[delayID].id;
  result.appendChild(div);
  let input = el('input');
  input.value = allDB[delayID].todo;
  div.appendChild(input);
  let delBtn = el('button');
  delBtn.textContent = "削除";
  delBtn.onclick = "click()";
  div.appendChild(delBtn);
  let editBtn = el('button');
  editBtn.textContent = "更新";
  div.appendChild(editBtn);;
}

// 更新・削除機能
result.addEventListener('click', (event) => {
  let eventElem = event.target;
  let parentElem = eventElem.parentNode;
  l(eventElem)
  l(parentElem.id)
  let input = parentElem.querySelector("input");
  l(input.value);
  if (eventElem.textContent === "削除") {
    l("削除");
    delID = Number(parentElem.id);
    parentElem.remove();
    message = "削除";
    db.ref(`/users/${firebase.auth().currentUser.uid}/${delID}`).remove();
  }
  else if (eventElem.textContent === "更新"){
    l("更新");
    message = "更新"
    input.value = input.value;
    db.ref(`/users/${firebase.auth().currentUser.uid}/${parentElem.id}`).update({
      todo: input.value
    })
  }
});
// ログインボタン
let loginFC = ()=> {
  // firebase.auth().signInWithPopup(provider).then(function(result) {
  firebase.auth().signInWithRedirect(provider).then(function(result) {
    l("Login successful.")
    // location.reload();
  }).catch(function(error) {
    errorCode = error
  });
};
// ログアウトボタン
let logoutFC = ()=> {
  firebase.auth().signOut().then(() => {
    l("Sign-out successful.")
    location.reload();
  }).catch(function(error) {
    l("An error happened.")
  });
}
// リダイレクト処理の場合
firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    var token = result.credential.accessToken;
    l("redirected")
    location.reload();
  }
  var user = result.user;
}).catch(function(error) {
  l("redirected false")
});