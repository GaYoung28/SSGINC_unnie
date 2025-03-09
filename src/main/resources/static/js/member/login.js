// 메시지 표시: type이 "success"이면 초록색, 아니면 빨간색으로 표시
function showMsg(element, type, message) {
    element.html(`<p>${message}</p>`).css('color', type === "success" ? 'green' : 'red');
}

window.onload = function() {
    // ---------------------------
    // 일반 로그인 처리
    // ---------------------------
    const emailInput = document.querySelector('.login-input[type="text"]');
    const passwordInput = document.querySelector('.login-input[type="password"]');
    const loginButton = document.querySelector('.login-button');

    const $emailError = $("#emailError");       // 이메일 입력 칸 아래 메시지 영역
    const $emailPwError = $("#emailPwError");     // 로그인 버튼 하단 전체 메시지 영역

    function checkEmailFormat(){
        const email = emailInput.value.trim();
        //이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showMsg($emailError, "error", "이메일 형식이 올바르지 않습니다.");
            return false;
        } else {
            $emailError.html(''); // 에러 없으면 지우기
            return true;
        }
    }

    // 이메일 input에서 이메일 형식 검사
    emailInput.addEventListener('blur', function() {
        checkEmailFormat();
    });

    loginButton.addEventListener('click', function() {

        // 기존 에러 메시지 초기화
        $emailError.html('');
        $emailPwError.html('');

        // JSON 형식으로 데이터 생성
        const payload = {
            memberEmail: emailInput.value.trim(),
            memberPw: passwordInput.value.trim()
        };

        // axios를 사용하여 POST 요청 보내기
        axios.post('/api/member/login', payload)
            .then(response => {
                // 로그인 성공 시 처리
                console.log("로그인 성공:", response.data);
                alert("로그인 성공!");
                window.location.href = '/'; // 로그인 성공 후 홈으로 이동
            })
            .catch(error => {
                // 로그인 실패 시 처리
                console.error("로그인 실패:", error);
                showMsg($emailPwError, "error", "이메일 또는 비밀번호를 다시 확인하세요..");
            });
    });

    // ---------------------------
    //  네이버 로그인
    // ---------------------------
    var naverLogin = new naver_id_login("cVXzKiI7vI8yCxFy2axQ", "http://localhost:8111/callback.html");
    var state = naverLogin.getUniqState();
    naverLogin.setState(state);
    naverLogin.setDomain("http://localhost:8111");
    naverLogin.init_naver_id_login();

    //네이버 로그인 버튼에 클릭 이벤트 연결
    document.getElementById("naver-login").addEventListener("click", function() {
        var naverAnchor = document.querySelector("#naver_id_login a");
        if(naverAnchor) {
            naverAnchor.click();
        } else {
            console.error("네이버 로그인 버튼 요소를 찾을 수 없습니다.");
        }
    });

    // ---------------------------
    // 구글 로그인
    // ---------------------------
    function handleGoogleCredentialResponse(response) {
        // response.credential JWT ID 토큰
        const responsePayload = parseJwt(response.credential);
        console.log("Email: " + responsePayload.email); //이메일
        console.log("Full Name: " + responsePayload.name);

        // 필요한 정보를 추출
        var email = responsePayload.email;
        var name = responsePayload.name;
        var nickname = "";
        var gender = "";
        var mobile = "";
        // 임의의 8자리 비밀번호 생성
        var password = generateRandomPassword8();

        // 동적으로 form을 생성하여 POST 방식으로 소셜 프로필 정보를 전달
        var form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/oauth/register";
        form.innerHTML =
            "<input type='hidden' name='memberEmail' value='" + email + "'/>" +
            "<input type='hidden' name='memberPw' value='" + password + "'/>" +
            "<input type='hidden' name='memberName' value='" + name + "'/>" +
            "<input type='hidden' name='memberNickname' value='" + nickname + "'/>" +
            "<input type='hidden' name='memberGender' value='" + gender + "'/>" +
            "<input type='hidden' name='memberPhone' value='" + mobile + "'/>" +
            "<input type='hidden' name='memberProvider' value='google'/>";

        document.body.appendChild(form);

        form.submit();
    }

    // JWT 토큰 디코딩 함수
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // 구글 로그인 초기화
    google.accounts.id.initialize({
        client_id: "622792225889-1ct0c68forahk36vi5mtst55p0urlida.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse
    });

    // 공식 구글 로그인 버튼을 'google_button_div'에 렌더링
    google.accounts.id.renderButton(
        document.getElementById("google_button_div"),
        { theme: "outline", size: "large", type: "icon", shape: "circle" }  // 버튼
    );
    // 필요 시 One Tap 다이얼로그 표시
    google.accounts.id.prompt();


    // ---------------------------
    // 카카오 로그인
    // ---------------------------
    // 카카오 초기화
    Kakao.init('c7cdd20b06e3d7b9ba90c721ec687bee');
    console.log("Kakao 초기화 상태: " + Kakao.isInitialized());

    // 카카오 로그인 버튼 클릭 이벤트 연결
    document.getElementById("kakao-login").addEventListener("click", function() {
        Kakao.Auth.login({
            success: function(authObj) {
                console.log("카카오 로그인 성공:", authObj);
                // 사용자 정보 요청
                Kakao.API.request({
                    url: '/v2/user/me',
                    success: function(res) {
                        console.log("사용자 정보:", res);
                        // kakao_account가 존재하는지 확인
                        var account = res.kakao_account;
                        if (!account) {
                            console.error("kakao_account 정보가 없습니다.");
                            return;
                        }
                        // 이메일, 이름
                        var email = account.email;
                        var name = account.profile && account.profile.nickname ? account.profile.nickname : "";
                        var nickname = "";
                        var gender = "";
                        var mobile = "";
                        // 8자리 임의 비밀번호 생성
                        var password = generateRandomPassword8();
                        // 동적으로 form을 생성하여 POST 방식으로 소셜 프로필 정보를 전달
                        var form = document.createElement("form");
                        form.method = "POST";
                        form.action = "/api/oauth/register";
                        form.innerHTML =
                            "<input type='hidden' name='memberEmail' value='" + email + "'/>" +
                            "<input type='hidden' name='memberPw' value='" + password + "'/>" +
                            "<input type='hidden' name='memberName' value='" + name + "'/>" +
                            "<input type='hidden' name='memberNickname' value='" + nickname + "'/>" +
                            "<input type='hidden' name='memberGender' value='" + gender + "'/>" +
                            "<input type='hidden' name='memberPhone' value='" + mobile + "'/>" +
                            "<input type='hidden' name='memberProvider' value='kakao'/>";

                        document.body.appendChild(form);
                        form.submit();
                    },
                    fail: function(error) {
                        console.error("사용자 정보 요청 실패:", error);
                    }
                });
            },
            fail: function(err) {
                console.error("카카오 로그인 실패:", err);
            }
        });
    });

    // 8자리 랜덤 비밀번호 생성 함수
    function generateRandomPassword8() {
        return 'xxxxxxxx'.replace(/[x]/g, function() {
            return Math.floor(Math.random() * 16).toString(16);
        });
    }
};
