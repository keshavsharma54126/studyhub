"use client";

import { cn } from "../utils/cn.js";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const currentWord = words[currentWordIndex]?.text;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentWord && currentText.length < currentWord.length) {
      timeout = setTimeout(() => {
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      }, 50);
    }
    return () => clearTimeout(timeout);
  }, [currentText, currentWord]);

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      {words.map((word, idx) => {
        const isCurrentWord = idx === currentWordIndex;
        return (
          <motion.div
            key={word.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("", word.className)}
          >
            <span>{isCurrentWord ? currentText : word.text}</span>
            {idx < words.length - 1 && <span>&nbsp;</span>}
          </motion.div>
        );
      })}
    </div>
  );
};
