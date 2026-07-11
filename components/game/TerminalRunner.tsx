'use client';

import { useEffect, useRef, useState } from 'react';

export default function TerminalRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 200;

    let animationId: number;
    let currentScore = 0;
    let isJumping = false;
    let jumpHeight = 0;
    let gravity = 0.6;
    let jumpVelocity = 0;
    let obstacles: { x: number; width: number; height: number }[] = [];
    let gameSpeed = 5;

    const player = {
      x: 50,
      y: canvas.height - 60,
      width: 30,
      height: 50
    };

    function createObstacle() {
      const width = 20 + Math.random() * 30;
      const height = 30 + Math.random() * 40;
      obstacles.push({
        x: canvas.width,
        width,
        height
      });
    }

    function jump() {
      if (!isJumping) {
        isJumping = true;
        jumpVelocity = -12;
      }
    }

    function checkCollision() {
      for (const obstacle of obstacles) {
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y + player.height > canvas.height - obstacle.height
        ) {
          return true;
        }
      }
      return false;
    }

    function gameLoop() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update player
      if (isJumping) {
        jumpVelocity += gravity;
        player.y += jumpVelocity;

        if (player.y >= canvas.height - 60) {
          player.y = canvas.height - 60;
          isJumping = false;
          jumpVelocity = 0;
        }
      }

      // Draw player
      ctx.fillStyle = '#0aee3c';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Update and draw obstacles
      ctx.fillStyle = '#0aee3c';
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        ctx.fillRect(
          obstacles[i].x,
          canvas.height - obstacles[i].height,
          obstacles[i].width,
          obstacles[i].height
        );

        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1);
          currentScore += 10;
          setScore(currentScore);
          
          if (currentScore % 100 === 0) {
            gameSpeed += 0.5;
          }
        }
      }

      // Draw ground
      ctx.strokeStyle = '#0aee3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 10);
      ctx.lineTo(canvas.width, canvas.height - 10);
      ctx.stroke();

      // Check collision
      if (checkCollision()) {
        setGameOver(true);
        cancelAnimationFrame(animationId);
        return;
      }

      animationId = requestAnimationFrame(gameLoop);
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const obstacleInterval = setInterval(createObstacle, 2000);
    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(obstacleInterval);
    };
  }, [gameStarted]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black/50 border border-[#0aee3c]/20 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-[#0aee3c] mb-4">Terminal Runner</h3>
        <div className="mb-4 flex justify-between items-center">
          <p className="text-[#0aee3c]/80">Score: {score}</p>
          <p className="text-[#0aee3c]/60 text-sm">Press SPACE to jump</p>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full border border-[#0aee3c]/20 rounded"
            style={{ maxHeight: '200px' }}
          />
          
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <button
                onClick={resetGame}
                className="bg-[#0aee3c] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#0aee3c]/80 transition-colors"
              >
                Start Game
              </button>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <p className="text-[#0aee3c] text-2xl mb-4">Game Over!</p>
              <p className="text-[#0aee3c]/80 mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="bg-[#0aee3c] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#0aee3c]/80 transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
