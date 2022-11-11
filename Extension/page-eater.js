var iter = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    var result = [];
    window.scrollTo(0, 0);
    await sleep(100);
    for (var j = 0; j < 10000; j++) {
        if (window.scrollY == window.scrollMaxY ) {
            break
        }
        for (i = 0; i < iter.children.length; i++) {
            result.push(searchTree(iter.children[i]));
        }
        window.scrollBy(0, 100);
        await sleep(50);
    };
    browser.runtime.sendMessage(result.filter(function(item, pos) {
        return result.indexOf(item) == pos;
    }));
}
main();


function searchTree(element) {
    if (element?.href?.startsWith("https://www.epidemicsound.com/track/")) {
        return element.href;
    } else if (element.children != null) {
        var i;
        var result = null;
        for (i = 0; result == null && i < element.children.length; i++) {
            result = searchTree(element.children[i]);
        }
        return result;
    }
    return null;
}
