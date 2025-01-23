import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export const ScratchCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [joke, setJoke] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scratchPercentage = useRef(0);

  const fetchJoke = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://v2.jokeapi.dev/joke/Programming?type=single');
      const data = await response.json();
      setJoke(data.joke);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch joke. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFF8DC');
    gradient.addColorStop(1, '#FFD700');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add "Scratch here!" text
    ctx.font = '20px Arial';
    ctx.fillStyle = '#8B5CF6';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch here!', canvas.width / 2, canvas.height / 2);
  };

  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = (e instanceof MouseEvent ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) {
        transparentPixels++;
      }
    }

    scratchPercentage.current = (transparentPixels / (pixels.length / 4)) * 100;

    if (scratchPercentage.current > 50 && !isRevealed) {
      setIsRevealed(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const resetCard = () => {
    setIsRevealed(false);
    scratchPercentage.current = 0;
    fetchJoke();
    initCanvas();
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      initCanvas();
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">Scratch & Laugh</h1>
        
        <div className="relative">
          <div className="bg-white p-4 rounded-lg min-h-[200px] flex items-center justify-center text-center">
            <p className="text-lg font-medium text-gray-800">{joke}</p>
          </div>
          
          <canvas
            ref={canvasRef}
            width={350}
            height={200}
            className="absolute top-0 left-0 w-full h-full scratch-card rounded-lg"
            onMouseMove={!isRevealed ? handleScratch : undefined}
            onTouchMove={!isRevealed ? handleScratch : undefined}
          />
        </div>

        <Button 
          onClick={resetCard} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "New Joke"}
        </Button>
      </div>
    </div>
  );
};