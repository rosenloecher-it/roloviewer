import { FifoSelectLimit } from "../../../app/worker/crawler/fifoSelectLimit";

describe('FifoSelectLimit', () => {

  it ('existsElements', () => {
    let text;

    const fifo = new FifoSelectLimit();

    expect(fifo.getSize()).toBe(0);

    text = "1";
    expect(fifo.exists(text)).toBe(false);
    fifo.add(text);
    expect(fifo.exists(text)).toBe(false);

    fifo.setSize(3);

    fifo.add(text);
    expect(fifo.exists(text)).toBe(true);

    text = "2";
    fifo.add(text);
    expect(fifo.exists(text)).toBe(true);

    text = "3";
    fifo.add(text);
    expect(fifo.exists(text)).toBe(true);

    expect(fifo.exists("1")).toBe(true);

    text = "4";
    fifo.add(text);
    expect(fifo.exists(text)).toBe(true);

    expect(fifo.exists("1")).toBe(false);

  });

  it ('candidates', () => {

    const fifo = new FifoSelectLimit();

    fifo.setSize(5);
    fifo.add("1");
    fifo.add("2");
    fifo.add("3");
    fifo.add("4");
    fifo.add("5");

    expect(fifo.setAndCheckCandidate("4")).toBe(false);
    expect(fifo.getCandidate()).toBe("4");

    expect(fifo.setAndCheckCandidate("2")).toBe(false);
    expect(fifo.getCandidate()).toBe("2");

    expect(fifo.setAndCheckCandidate("3")).toBe(false);
    expect(fifo.getCandidate()).toBe("2");

    expect(fifo.setAndCheckCandidate("x")).toBe(true);
    expect(fifo.getCandidate()).toBe("x");


  });

});
