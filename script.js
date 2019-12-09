let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

let listSize = 100;
const DBSize = 2000;

let currentIndex = 0;

let elements = []

const initList = num => {
    const container = document.querySelector(".cat-list");
    for (let i = 0; i < num; i++) {
        const tile = document.createElement("LI");
        tile.setAttribute("class", "cat-tile");
        tile.setAttribute("id", "cat-tile-" + i);
        // console.log(i)
        for (let k = 0; k < 5; k++) {
            const img = document.createElement("IMG"); // ("IMG");
            const t = document.createTextNode(`[${i} ${k}]`);
            img.appendChild(t);
            img.setAttribute("src", `https://mobvita.cs.helsinki.fi/id/${(i * 10 + k)}/80`); // DB[i].imgSrc);
            tile.appendChild(img);
        }
        container.appendChild(tile);
        elements.push(tile)
    }

}

const getSlidingWindow = isScrollDown => {
    const increment = listSize / 2;
    let firstIndex;

    if (isScrollDown) {
        firstIndex = currentIndex + increment;
    } else {
        firstIndex = currentIndex - increment - listSize;
    }

    if (firstIndex < 0) {
        firstIndex = 0;
    }

    // console.log("firstIndex", firstIndex)

    return firstIndex;
}

const recycleDOM = firstIndex => {
    for (let i = 0; i < listSize; i++) {
        const tile = document.querySelector("#cat-tile-" + i);
        // // console.log("recycling dom", i + firstIndex, tile.children.length)
        // tile.setAttribute("src", `https://picsum.photos/id/${(((i + firstIndex)*10))%1000}/100/100`);
        for (let k = 0; k < tile.children.length; k++) {
            tile.children[k].innerText = `[${i + firstIndex} ${k}]`
            tile.children[k].setAttribute("lazy", `https://mobvita.cs.helsinki.fi/id/${(((i + firstIndex) * 10) + k)}/80`);
            tile.children[k].setAttribute("src", "loading-icon.svg");
        }
    }
}

const throttle = (func, limit) => {
    let inThrottle
    return function () {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

let sanic = false

const inAdvance = 600
function lazyload() {
    if (sanic)
        return;
    // console.log("WAT")
    elements.forEach(tile => {
        // console.log("WAT2", tile.offsetTop < window.innerHeight + window.pageYOffset + 300)
        if (tile.offsetTop < window.innerHeight + window.pageYOffset + inAdvance ||
            tile.offsetTop > window.pageYOffset - inAdvance)
        {
            // console.log(tile.innerText)
            for (let k = 0; k < tile.children.length; ++k) {
                // console.log("lazy", tile.children[k].lazy)
                const lazy = tile.children[k].getAttribute('lazy')
                if (lazy) {
                    tile.children[k].setAttribute('src', lazy)
                    tile.children[k].removeAttribute('lazy')
                }
            }
        }
    })
}

// window.addEventListener('scroll', throttle(lazyload, 500))
// window.addEventListener('resize', throttle(lazyload, 500))
setInterval(lazyload, 500)

var checkScrollSpeed = (function(settings){
    settings = settings || {};

    var lastPos, newPos, timer, delta, 
        delay = settings.delay || 50; // in "ms" (higher means lower fidelity )

    function clear() {
      lastPos = null;
      delta = 0;
    }

    clear();

    return function(){
      newPos = window.scrollY;
      if ( lastPos != null ){ // && newPos < maxScroll 
        delta = newPos -  lastPos;
      }
      lastPos = newPos;
      clearTimeout(timer);
      timer = setTimeout(clear, delay);
      return delta;
    };
})();

// listen to "scroll" event
window.onscroll = function(){
    const speed = checkScrollSpeed();
    if (Math.abs(speed) >= 75) {
        // cancel stuff
        sanic = true;
    } else {
        sanic = false;
    }
};

const getNumFromStyle = numStr => Number(numStr.substring(0, numStr.length - 2));

const adjustPaddings = isScrollDown => {
    const container = document.querySelector(".cat-list");
    const currentPaddingTop = getNumFromStyle(container.style.paddingTop);
    const currentPaddingBottom = getNumFromStyle(container.style.paddingBottom);
    const remPaddingsVal = 170 * (listSize / 2);
    if (isScrollDown) {
        container.style.paddingTop = currentPaddingTop + remPaddingsVal + "px";
        container.style.paddingBottom = currentPaddingBottom === 0 ? "0px" : currentPaddingBottom - remPaddingsVal + "px";
    } else {
        container.style.paddingBottom = currentPaddingBottom + remPaddingsVal + "px";
        container.style.paddingTop = currentPaddingTop === 0 ? "0px" : currentPaddingTop - remPaddingsVal + "px";

    }
}

const topSentCallback = entry => {
    if (currentIndex === 0) {
        const container = document.querySelector(".cat-list");
        container.style.paddingTop = "0px";
        container.style.paddingBottom = "0px";
    }

    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

    // conditional check for Scrolling up
    if (
        currentY > topSentinelPreviousY &&
        isIntersecting &&
        currentRatio >= topSentinelPreviousRatio &&
        currentIndex !== 0
    ) {
        const firstIndex = getSlidingWindow(false);
        adjustPaddings(false);
        recycleDOM(firstIndex);
        currentIndex = firstIndex;
    }

    topSentinelPreviousY = currentY;
    topSentinelPreviousRatio = currentRatio;
}

const botSentCallback = entry => {
    // console.log("currentindex", currentIndex, listSize)
    // if (currentIndex === DBSize - listSize) {
    //     return; // actual bottom of list
    // }
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

    // conditional check for Scrolling down
    if (
        currentY < bottomSentinelPreviousY &&
        currentRatio > bottomSentinelPreviousRatio &&
        isIntersecting
    ) {
        // console.log("sliding?")
        const firstIndex = getSlidingWindow(true);
        adjustPaddings(true);
        recycleDOM(firstIndex);
        currentIndex = firstIndex;
    }

    bottomSentinelPreviousY = currentY;
    bottomSentinelPreviousRatio = currentRatio;
}

const initIntersectionObserver = () => {
    const options = {
        /* root: document.querySelector(".cat-list") */
    }

    const callback = entries => {
        entries.forEach(entry => {
            if (entry.target.id === 'cat-tile-0') {
                // console.log("TOP")
                topSentCallback(entry);
            } else if (entry.target.id === `cat-tile-${listSize - 1 - 0}`) {
                // console.log("BOTTOM")
                botSentCallback(entry);
            }
        });
    }

    var observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector("#cat-tile-0"));
    observer.observe(document.querySelector(`#cat-tile-${listSize - 1 - 0}`));
}

const start = () => {
    initList(listSize);
    initIntersectionObserver();
}