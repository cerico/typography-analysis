let longestLine = {
  width: 0,
  element: null
};
const longLines = []
const flaggedElements = new Set();
const INCLUDED_TAGS = ['p']
const preferredMaxWidth = 75
const itsABlockOfText = 100

const tempElement = document.createElement('span');
tempElement.style.visibility = 'hidden';
tempElement.style.position = 'absolute';
tempElement.style.whiteSpace = 'nowrap';
document.body.appendChild(tempElement);

function getElementHierarchyPath(element) {
  let path = [];
  while (element) {
    let segment = element.tagName.toLowerCase();

    if (element.id) {
      segment += `#${element.id}`;
    } else if (element.className && typeof element.className === 'string') {
      segment += `.${element.className.split(' ').join('.')}`;
    }

    path.unshift(segment);
    element = element.parentElement;
  }
  return path.join(' > ');
}

const isIncluded = (node) => {
  return node.nodeType === Node.ELEMENT_NODE && INCLUDED_TAGS.includes(node.tagName?.toLowerCase());
};


const measureLineWidths = (element) => {
  if (flaggedElements.has(element)) {
    return; // Skip this element since it's already flagged
  }
  const words = element.textContent.trim().split(/\s+/);
  if (words.length < itsABlockOfText) {
    return
  }
  let currentLine = '';
  let currentLineWidth = 0;

  for (let word of words) {
    const previousWidth = tempElement.offsetWidth;
    let asda = currentLine
    currentLine += word + ' ';
    tempElement.textContent = currentLine;
    const newWidth = tempElement.offsetWidth;

    if (tempElement.offsetWidth > element.offsetWidth) {
      if (asda.length > preferredMaxWidth) {
        const really = {
          width: previousWidth,
          element: element,
          textContent: asda
        }
        longLines.push(really)
        flaggedElements.add(element); // Flag this element
        return; // Exit the function early since the element is flagged
      }
      currentLine = word + ' ';
    }
  }
  if (currentLine.length > preferredMaxWidth) {
    longLines.push({
      width: tempElement.offsetWidth,
      element: element,
      textContent: currentLine
    });
  }
};

const traverseDOM = (node) => {
  if (isIncluded(node)) {
    measureLineWidths(node);
  }
  node.childNodes.forEach(traverseDOM);
};

const initialize = () => {
  console.log('init')
  traverseDOM(document.body);

  for (let line of longLines) {
    console.log(`Consider shortening this line: ${line.textContent}`)
    const computedStyle = window.getComputedStyle(line.element);
    const fontSize = computedStyle.getPropertyValue('font-size');
    console.log(`it has ${line.textContent.length} characters at ${fontSize}`);
    console.log(`suggestion: increase the font size to...${parseFloat(fontSize) * (line.textContent.length / preferredMaxWidth)}`);
    const containerWidth = computedStyle.getPropertyValue('width');
    console.log(`suggestion: reduce the container width to...${parseFloat(containerWidth) * (preferredMaxWidth / line.textContent.length)}`);
    console.log(`element is ${getElementHierarchyPath(line.element)}`)
    line.element.classList.add("long-line");
  }
  document.body.removeChild(tempElement);
}

initialize()
