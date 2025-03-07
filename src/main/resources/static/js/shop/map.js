let map;
let markers = []; // 상점 마커 저장 배열
let userMarker = null; // 사용자 위치 마커

// 카테고리에 따른 마커 아이콘 반환 함수
function getMarkerIcon(category) {
    const normalized = category.trim();
    switch(normalized) {
        case "헤어샵":
            return '/img/shop/map_hair.png';
        case "네일샵":
            return '/img/shop/map_neil.png';
        case "에스테틱":
            return '/img/shop/map_aesthetic.png';
        case "왁싱샵":
            return '/img/shop/map_waxing.png';
        case "바버샵":
            return '/img/shop/map_barber.png';
        default:
            console.warn("지원하지 않는 카테고리:", category);
            return '/img/map_default.png';
    }
}

// 지도 영역 내 상점만 필터링 (옵션)
function filterShopsInView(shops) {
    const bounds = map.getBounds();
    return shops.filter(shop => {
        const shopLatLng = new naver.maps.LatLng(shop.shopLatitude, shop.shopLongitude);
        return bounds.hasLatLng(shopLatLng);
    });
}

// 기존 마커 제거
function removeMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// 마커 업데이트
function updateMarkers(shops) {
    removeMarkers();
    const visibleShops = filterShopsInView(shops);
    visibleShops.forEach(shop => {
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(shop.shopLatitude, shop.shopLongitude),
            map: map,
            title: `${shop.shopName} - ${shop.shopCategory}`,
            icon: {
                url: getMarkerIcon(shop.shopCategory),
                size: new naver.maps.Size(40, 40),
                anchor: new naver.maps.Point(20, 20)
            }
        });
        markers.push(marker);

        // 마커 클릭 시 상세 페이지로 이동
        naver.maps.Event.addListener(marker, 'click', function() {
            window.location.href = `shopdetail?shopId=${shop.shopId}`;
        });
    });
}

// 지도 초기화 함수
function initMap(lat, lng, shops) {
    const mapOptions = {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 15
    };
    map = new naver.maps.Map('map', mapOptions);
    updateMarkers(shops);

    // 사용자 위치 마커 생성
    userMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: map,
        title: '현재 위치'
    });
}

// 사용자 위치와 상점 데이터 로드 후 지도 초기화
function getLocationAndInit() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                // Reverse Geocoding을 통해 내 위치 업데이트
                updateMyLocationText(lat, lng);
                // 지도 초기화 및 상점 데이터 로드
                fetch('/api/shop')
                    .then(response => response.json())
                    .then(data => {
                        initMap(lat, lng, data.data.shops);
                    })
                    .catch(error => {
                        console.error('상점 데이터를 가져오는 데 실패했습니다:', error);
                    });
            },
            error => {
                console.error('위치 정보를 가져올 수 없습니다:', error.message);
                // 위치 권한 거부 시 fallback: 주소 입력 폼 표시
                document.getElementById('addressFallback').style.display = 'block';
            },
            { enableHighAccuracy: true }
        );
    } else {
        console.error('브라우저가 위치 정보를 지원하지 않습니다.');
    }
}

// Reverse Geocoding: 현재 위치 주소 업데이트 함수
function updateMyLocationText(lat, lng) {
    naver.maps.Service.reverseGeocode(
        {
            coords: new naver.maps.LatLng(lat, lng),
            orders: [naver.maps.Service.OrderType.ADDR, naver.maps.Service.OrderType.ROAD_ADDR].join(',')
        },
        function(status, response) {
            if (status === naver.maps.Service.Status.OK) {
                const result = response.v2.results[0];
                if (result) {
                    const { region } = result;
                    const area1 = region.area1.name || '';
                    const area2 = region.area2.name || '';
                    const shortAddress = `${area1} ${area2}`.trim();
                    document.getElementById('myLocationText').textContent = shortAddress || '현재 위치';
                } else {
                    document.getElementById('myLocationText').textContent = '주소 정보를 찾을 수 없습니다.';
                }
            } else {
                console.error('Reverse Geocoding 실패:', status);
                document.getElementById('myLocationText').textContent = '주소 정보를 불러오지 못했습니다.';
            }
        }
    );
}

// "이 지역 재검색" 버튼 클릭 이벤트
document.getElementById('reSearchBtn').addEventListener('click', () => {
    const center = map.getCenter();
    const lat = center.lat();
    const lng = center.lng();
    const currentZoom = map.getZoom();
    fetch('/api/shop')
        .then(response => response.json())
        .then(data => {
            updateMarkers(data.data.shops);
            map.setCenter(new naver.maps.LatLng(lat, lng));
            map.setZoom(currentZoom);
        })
        .catch(error => {
            console.error('상점 데이터를 가져오는 데 실패했습니다:', error);
        });
});

// 카테고리별 매장 불러오기 함수
function loadShopsByCategory(category) {
    fetch(`/api/shop/category/${category}`)
        .then(res => res.json())
        .then(response => {
            const shops = response.data.shops;
            renderShopList(shops);
        })
        .catch(err => {
            console.error('카테고리별 상점 조회 실패:', err);
        });
}

// 매장 목록을 DOM에 렌더링하는 함수
function renderShopList(shops) {
    const shopListEl = document.getElementById('shopList');
    shopListEl.innerHTML = ''; // 기존 목록 초기화

    shops.forEach(shop => {
        const item = document.createElement('div');
        item.classList.add('shop-item');

        item.innerHTML = `
          <div class="shop-thumbs">
            <img src="/img/shop/download.jpg" alt="이미지1" />
            <img src="/img/shop/download.jpg" alt="이미지2" />
            <img src="/img/shop/download.jpg" alt="이미지3" />
          </div>
          <div class="shop-info">
            <h3>
              <a href="/shopdetail?shopId=${shop.shopId}">
                ${shop.shopName}
              </a>
            </h3>
            <p class="shop-location">${shop.shopLocation}</p>
            <p>평점 ${shop.avgRate} / 리뷰 ${shop.review_count}</p>
          </div>
        `;
        shopListEl.appendChild(item);
    });
}

// Daum 우편번호 서비스로 주소 검색 팝업 열기
function openDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            // 선택된 주소 (기본 주소)
            var fullAddr = data.address;
            searchAddressToCoordinate(fullAddr);
        }
    }).open();
}

// 주소 검색을 통한 좌표 변환 함수 (네이버 지도 Geocoder 사용)
function searchAddressToCoordinate(address) {
    naver.maps.Service.geocode(
        { query: address },
        function(status, response) {
            if (status === naver.maps.Service.Status.OK) {
                const result = response.v2.addresses[0];
                if (!result) {
                    console.error("주소 검색 결과가 없습니다.");
                    return;
                }
                const lat = parseFloat(result.y);
                const lng = parseFloat(result.x);

                // 여기서 직접 입력한 주소를 #myLocationText에 표시
                document.getElementById('myLocationText').textContent = address;

                // 지도 초기화 (상점 데이터 다시 fetch)
                fetch('/api/shop')
                    .then(response => response.json())
                    .then(data => {
                        initMap(lat, lng, data.data.shops);
                        // 주소 입력 폼 숨기기
                        document.getElementById('addressFallback').style.display = 'none';
                    })
                    .catch(error => {
                        console.error('상점 데이터를 가져오는 데 실패했습니다:', error);
                    });
            } else {
                alert('주소 검색에 실패했습니다. 올바른 주소를 입력해 주세요.');
            }
        }
    );
}


// 주소 입력 fallback의 "주소 검색" 버튼 클릭 이벤트
document.getElementById('openPostcodeBtn').addEventListener('click', function(){
    openDaumPostcode();
});

// 바텀시트 높이 조절 기능 구현 (마우스/터치 이벤트)
(function() {
    const bottomSheet = document.getElementById('bottomSheet');
    const dragHandle = document.querySelector('.drag-handle');
    let startY, startHeight;

    // 마우스 이벤트
    dragHandle.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = bottomSheet.offsetHeight;
        document.documentElement.style.cursor = 'ns-resize';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        const dy = startY - e.clientY;
        let newHeight = startHeight + dy;
        const containerHeight = document.getElementById('map-container').clientHeight;
        const maxHeight = containerHeight * 0.9;  // 최대 90%
        const minHeight = containerHeight * 0.3;  // 최소 30%
        newHeight = Math.min(newHeight, maxHeight);
        newHeight = Math.max(newHeight, minHeight);
        bottomSheet.style.height = `${newHeight}px`;
    }

    function onMouseUp() {
        document.documentElement.style.cursor = 'default';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // 터치 이벤트 (모바일 대응)
    dragHandle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startHeight = bottomSheet.offsetHeight;
        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
    });

    function onTouchMove(e) {
        const dy = startY - e.touches[0].clientY;
        let newHeight = startHeight + dy;
        const containerHeight = document.getElementById('map-container').clientHeight;
        const maxHeight = containerHeight * 0.9;
        const minHeight = containerHeight * 0.3;
        newHeight = Math.min(newHeight, maxHeight);
        newHeight = Math.max(newHeight, minHeight);
        bottomSheet.style.height = `${newHeight}px`;
    }

    function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }
})();

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    getLocationAndInit();

    // 바텀시트 열기/닫기 이벤트
    const listViewBtn = document.getElementById('listViewBtn');
    const bottomSheet = document.getElementById('bottomSheet');
    const closeBottomSheetBtn = document.getElementById('closeBottomSheetBtn');

    listViewBtn.addEventListener('click', () => {
        bottomSheet.classList.add('open');
    });
    closeBottomSheetBtn.addEventListener('click', () => {
        bottomSheet.classList.remove('open');
    });

    // 카테고리 탭 버튼 클릭 이벤트
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedCategory = btn.getAttribute('data-category');
            loadShopsByCategory(selectedCategory);
        });
    });

    // 기본 탭(네일샵) 데이터 로드
    const defaultCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category');
    if (defaultCategory) {
        loadShopsByCategory(defaultCategory);
    }
});
