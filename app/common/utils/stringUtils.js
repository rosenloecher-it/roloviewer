
// ----------------------------------------------------------------------------------

export function shortenString(inputText, maxLength) {
  if (!inputText || !maxLength)
    return inputText;

  const absMaxLength = Math.abs(maxLength);
  const textLength = inputText.length;

  if (textLength <= absMaxLength)
    return inputText;
  if (textLength < 3 || absMaxLength < 3)
    return "";

  const repTxt = '...';
  const repLen = repTxt.length;

  let outputText = null;
  if (maxLength >= 0) {


    outputText = inputText.substring(0, maxLength - repLen) + repTxt;
  } else {

    const start = textLength - absMaxLength + repLen;
    const end = start + absMaxLength - repLen;

    outputText  = repTxt + inputText.substring(start, end);
  }

  return outputText;
}
// ----------------------------------------------------------------------------------

export function shortenPath(inputText, maxLength) {
  return shortenString(inputText, maxLength);
}

// ----------------------------------------------------------------------------------

export function randomString(length) {
  if (!length || length <= 0)
    return "";

  // generates onyl lowercase letters
  // let source = "";
  // if (source.length < length)
  //   source += Math.random().toString(36).substring(2);
  //
  // const random = source.substring(0, length);
  // return random;

  const possibleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const possibleAll = `${possibleLetters}0123456789`;

  const buffer = [];

  // start with letter
  buffer.push(possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length)));

  for (let i = 1; i < length; i += 1) {
    buffer.push(possibleAll.charAt(Math.floor(Math.random() * possibleAll.length)));
  }

  return buffer.join('');
}

// ----------------------------------------------------------------------------------
