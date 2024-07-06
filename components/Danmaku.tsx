import React, { useState, useEffect } from "react";

interface DanmakuItem {
  id: number;
  text: string;
  emoji: string;
}

const foodEmojis = ["🍔", "🍕", "🍣", "🍎", "🍩", "🍜", "🍪", "🍦", "🍇", "🥑"];
const foodMessages = [
  "I love burgers!",
  "Pizza is the best!",
  "Sushi time!",
  "An apple a day keeps the doctor away.",
  "Donuts are life!",
  "Ramen for the soul.",
  "Cookies for everyone!",
  "Ice cream party!",
  "Fresh grapes!",
  "Avocado toast is delicious!",
];

const getRandomFoodMessage = () => {
  const index = Math.floor(Math.random() * foodMessages.length);
  return {
    text: foodMessages[index],
    emoji: foodEmojis[index],
  };
};

const Danmaku: React.FC = () => {
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>([]);

  // 模拟添加新的弹幕
  useEffect(() => {
    const interval = setInterval(() => {
      const { text, emoji } = getRandomFoodMessage();
      setDanmakuList((prevList) => [
        ...prevList,
        { id: Math.random(), text, emoji },
      ]);
    }, 2000); // 每2秒添加一个新的弹幕

    return () => clearInterval(interval);
  }, []);

  // 清理超过一定数量的弹幕
  useEffect(() => {
    if (danmakuList.length > 15) {
      setDanmakuList((prevList) => prevList.slice(-15));
    }
  }, [danmakuList]);

  return (
    <div className="danmaku-container">
      {danmakuList.map((danmaku) => (
        <div key={danmaku.id} className="danmaku-item">
          <span className="emoji">{danmaku.emoji}</span> {danmaku.text}
        </div>
      ))}
    </div>
  );
};

export default Danmaku;
