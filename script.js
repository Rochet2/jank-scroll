const _getCatImg = () => {
    const randomNum = () => {
        return Math.floor(Math.random() * 100000);
    };
    // const url = "https://source.unsplash.com/collection/139386/100x100/?sig=";
    // const url = "https://picsum.photos/100/100" // ?test=";
    // return url // + randomNum();
    const url = "https://picsum.photos/100/100?test=";
    const rand = randomNum()
    return url + rand;
    console.log(rand)
};

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

let listSize = 20;

let currentIndex = 0;

const initList = num => {
    const container = document.querySelector(".cat-list");

    for (let i = 0; i < num; i++) {
        const tile = document.createElement("LI");
        tile.setAttribute("class", "cat-tile");
        tile.setAttribute("id", "cat-tile-" + i);
        console.log(i)
        for ( let k = 0; k< 5; k++) {
            const img = document.createElement("IMG");
            img.setAttribute("src", `https://picsum.photos/id/${(i*10+k)%1000}/100/100`); // DB[i].imgSrc);
            tile.appendChild(img);
        }
        container.appendChild(tile);
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

    console.log("firstIndex", firstIndex)

    return firstIndex;
}

const recycleDOM = firstIndex => {
    for (let i = 0; i < listSize; i++) {
        const tile = document.querySelector("#cat-tile-" + i);
        console.log("recycling dom", i + firstIndex, tile.children.length)
        for ( let k = 0; k< tile.children.length; k++) {
            tile.children[k].setAttribute("src", `https://picsum.photos/id/${(((i + firstIndex)*10)+k)%1000}/100/100`);
        }
    }
}

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
    console.log("currentindex", currentIndex, listSize)
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
        console.log("sliding?")
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
                console.log("TOP")
                topSentCallback(entry);
            } else if (entry.target.id === `cat-tile-${listSize - 1}`) {
                console.log("BOTTOM")
                botSentCallback(entry);
            }
        });
    }

    var observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector("#cat-tile-0"));
    observer.observe(document.querySelector(`#cat-tile-${listSize - 1}`));
}

const start = () => {
    initList(listSize);
    initIntersectionObserver();
}

