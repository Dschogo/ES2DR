let iter = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];


let result = [];
for (i = 0; i < iter.children.length; i++) {
    result.push(searchTree(iter.children[i]));
}


browser.runtime.sendMessage(result);
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
