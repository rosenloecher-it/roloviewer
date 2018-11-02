
export class FifoSelectLimit {

  constructor() {
    this.data = {
      size: 0,
      elements: [],
      candidatePos: -1,
      candidate: null
    };
  }

  // ........................................................

  setSize(size) {

    this.data.size = size;

    this.shift();
  }

  // ........................................................

  getSize() {
    return this.data.size;
  }

  // ........................................................

  shift() {

    const {data} = this;

    while (data.size < data.elements.length) {
      data.elements.shift();
    }
  }

  // ........................................................

  add(element) {
    if (!element)
      return;

    this.data.elements.push(element);
    this.shift();
  }

  // .....................................................

  exists(element) {

    const {elements} = this.data;

    for (let i = 0; i < elements.length; i++) {
      if (elements[i] === element)
        return true;
    }

    return false;
  }

  // .....................................................

  getElements() {
    return this.data.elements;
  }

  // .....................................................

  clearCandidates() {
    const {data} = this;

    data.candidatePos = -1;
    data.candidate = null;
  }

  // .....................................................

  setAndCheckCandidate(candidate) {
    const {data} = this;

    for (let i = data.elements.length - 1; i >= 0; i--) {
      if (data.elements[i] === candidate) {
        if (data.candidate === null || i < data.candidatePos) {
          data.candidate = candidate;
          data.candidatePos = i;
        }
        return false;
      }
    }

    data.candidate = candidate;
    data.candidatePos = -1;

    return true;
  }

  // .....................................................

  getCandidate() {

    return this.data.candidate;
  }

  // .....................................................

  isRepeatedCandidate() {
    const {data} = this;

    return (data.candidate && data.candidatePos >= 0)
  }

  // .....................................................


}

// ----------------------------------------------------------------------------------

