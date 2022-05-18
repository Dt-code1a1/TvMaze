const _getDOMElem = (attribute, value) => {
    return document.querySelector(`[${attribute}="${value}"]`)
}

const filterText = inputText => {
    const patern = new RegExp("<..>","g")
    const patern2 = new RegExp("<.>","g")
    const outputText = inputText.replace(patern, "").replace(patern2, "")
    return outputText
}

export const mapListToDOMElements = (listOfValues, attribute) => {
    const _viewElems = {}

  for (const value of listOfValues) {
    _viewElems[value] = _getDOMElem(attribute, value)
  }

  return _viewElems
}

export const createDOMElem = (tagName, className, innerText, src) => {
    const tag = document.createElement(tagName)
    tag.className = className

    if(innerText){
        tag.innerText = filterText(innerText)
    }

    if(src){
        tag.src = src
    }
    return tag
}