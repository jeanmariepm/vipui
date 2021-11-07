import Deal from "../deal";
import Agent from "../agent";

test("create an agent", () => {
  const hands = [
    { S: "KT74", H: "AK52", D: "Q6", C: "AJ5" },
    { S: "KJ965", H: "84", D: "AKQ95", C: "9" },
    { S: "Q8", H: "AKQ93", D: "J842", C: "T3" },
    { S: "A", H: "JT76", D: "T7", C: "KQ8763" },
    { S: "A", H: "JT76", D: "KQ8763", C: "T7" },
    { S: "KQ3", H: "AKQ93", D: "A5", C: "AJ5" },
    { S: "JT98764", H: "85", D: "82", C: "A2" },
    { S: "5", H: "QT76", D: "T7", C: "KQ8763" },
    { S: "A3", H: "JT76", D: "KQ876", C: "T7" },
    { S: "K2", H: "QJT93", D: "K982", C: "Q7" },
    { S: "KT74", H: "AK52", D: "6", C: "AQJ5" },
    { S: "J", H: "A63", D: "KJT7", C: "KT985" },
    { S: "42", H: "AQT9732", D: "T6", C: "A6" },
    { S: "KJ65", H: "KQT87", D: "T654", C: "" },
  ];

  let agent;

  agent = new Agent(hands[0]);
  expect(agent.getBid()).toBe("1T");
  expect(agent.getBid(["1H"])).toBe("1T");
  expect(agent.getBid(["1D"])).toBe("X"); // no stopper to bid 1T
  expect(agent.getBid(["2H"])).toBe("2T");
  expect(agent.getBid(["1D", "P"])).toBe("1H");
  expect(agent.getBid(["1T", "P"])).toBe("2C");
  expect(agent.getBid(["1T", "P", "4T", "P"])).toBe("6T");
  expect(agent.getBid(["1T", "P", "2C", "P"])).toBe("2H");
  expect(agent.getBid(["1T", "P", "3C", "P"])).toBe("3D");
  expect(agent.getBid(["1T", "P", "3H", "P"])).toBe("3S");
  expect(agent.getBid(["2T", "P", "3S", "P"])).toBe("3T");

  agent = new Agent(hands[1]);
  expect(agent.ltc).toBe(5);
  expect(agent.getBid()).toBe("1S");
  expect(agent.getBid(["1T", "P"])).toBe("2H");
  expect(agent.getBid(["1S", "P", "1T", "P"])).toBe("2D");
  expect(agent.getBid(["1S", "P", "2H", "P"])).toBe("3D");

  agent = new Agent(hands[2]);
  expect(agent.getBid()).toBe("1H");
  expect(agent.getBid(["P", "1S", "P"])).toBe("2H");
  expect(agent.getBid(["P", "1H", "P"])).toBe("4H");
  expect(agent.getBid(["1T", "P"])).toBe("2D");
  expect(agent.getBid(["1T", "P", "2D", "P", "2H", "P"])).toBe("3T");

  agent = new Agent(hands[3]);
  expect(agent.getBid()).toBe("1C");
  expect(agent.getBid(["1D", "1H", "P"])).toBe("4H");
  expect(agent.getBid(["1S", "2H", "P"])).toBe("P");
  expect(agent.getBid(["P", "1D", "P"])).toBe("1H");
  expect(agent.getBid(["P", "1S", "P"])).toBe("2C");
  expect(agent.getBid(["P", "1S", "P", "2C", "P", "2H", "P"])).toBe("3H");

  agent = new Agent(hands[4]);
  expect(agent.getBid()).toBe("1D");
  expect(agent.getBid(["1D", "P", "2C", "P"])).toBe("2H");

  agent = new Agent(hands[5]);
  expect(agent.getBid()).toBe("2C");
  expect(agent.getBid(["1H"])).toBe("X");

  agent = new Agent(hands[6]);
  expect(agent.getBid()).toBe("3S");
  agent = new Agent(hands[6], ["P"]);
  expect(agent.getBid()).toBe("3S");

  agent = new Agent(hands[7]);
  expect(agent.getBid()).toBe("P");
  expect(agent.getBid(["1D", "P"])).toBe("1H");
  expect(agent.getBid(["1H", "P"])).toBe("4H");
  expect(agent.getBid(["1S", "P"])).toBe("1T");

  agent = new Agent(hands[8]);
  expect(agent.getBid()).toBe("P");
  expect(agent.getBid(["1T"])).toBe("2D");

  agent = new Agent(hands[9]);
  expect(agent.getBid(["1S", "P", "2C"])).toBe("2H");

  agent = new Agent(hands[10]);
  expect(agent.getBid()).toBe("1C");

  agent = new Agent(hands[11]);
  expect(agent.getBid(["P", "P", "1C"])).toBe("P");

  agent = new Agent(hands[12]);
  expect(agent.getBid(["P", "P"])).toBe("1H");

  agent = new Agent(hands[13]);
  agent.print();
  expect(agent.getBid(["1D", "1H", "P", "1S", "P"])).toBe("2S");
});
