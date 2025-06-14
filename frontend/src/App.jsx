import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Line, Text, Image } from "react-konva";
import Konva from "konva";
import heroImage from "./assets/150.png";
import sceneImageSrc from "./assets/scene150.png"; // Scene image import

const heroGifs = [
  { label: "Local Hero PNG", url: heroImage },
  { label: "Flying Hero", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" },
  { label: "Running Hero", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
  { label: "Punching Hero", url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" },
  { label: "Standing Hero", url: "https://media.giphy.com/media/l0MYEw18Ma8Eeb3Ha/giphy.gif" },
];

const App = () => {
  const [elements, setElements] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedHeroGif, setSelectedHeroGif] = useState(heroGifs[0].url);
  const [imageMap, setImageMap] = useState({}); // id -> Image object
  const stageRef = useRef(null);
  const animationRef = useRef(null);
  const lastDragMoveTime = useRef(0);

  // Preload images for all elements of type 'image'
  useEffect(() => {
    const imgsToLoad = elements.filter((el) => el.shape === "image");
    imgsToLoad.forEach((el) => {
      if (!imageMap[el.id]) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = el.imgUrl;
        img.onload = () => {
          setImageMap((prev) => ({ ...prev, [el.id]: img }));
        };
      }
    });
  }, [elements, imageMap]);

  // Pulse animation on selected element
  useEffect(() => {
    if (!selectedId) return;

    const layer = stageRef.current.findOne("Layer");
    if (!layer) return;

    const shape = layer.findOne(`#${selectedId}`);
    if (!shape) return;

    let scaleUp = true;
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const scale = shape.scaleX();
      const newScale = scaleUp ? scale + 0.005 : scale - 0.005;
      if (newScale > 1.1) scaleUp = false;
      if (newScale < 1.0) scaleUp = true;
      shape.scale({ x: newScale, y: newScale });
    }, layer);

    anim.start();
    animationRef.current = anim;

    return () => {
      anim.stop();
      if (shape) shape.scale({ x: 1, y: 1 });
    };
  }, [selectedId]);

  // Throttled drag move handler
  const handleDragMove = (e, id) => {
    const now = Date.now();
    if (now - lastDragMoveTime.current < 16) return; // ~60fps throttle
    lastDragMoveTime.current = now;

    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el
      )
    );
  };

  async function generateText(finalPrompt) {
    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, max_length: 200 }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error from server: ${errText}`);
      }

      const data = await response.json();
      return data.generated_text;
    } catch (error) {
      console.error("Error generating text:", error);
      return null;
    }
  }

  const onGenerateClick = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first.");
      return;
    }

    // Use the raw prompt inside template
    const promptTemplate = `
You are a creative sci-fi storyteller.
Write a short comic scene based on the conflict described below.
Setting: The hero is standing alone in outer space.
Instructions: Be concise and vivid. Use descriptive, dramatic imagery and action.
Conflict: "${prompt.trim()}"
Describe what happens next in 4-5 vivid sentences.
Include dialogue that shows the characters' emotions and decisions.
End the scene with a cliffhanger or major event to build suspense.
Use natural and meaningful dialogue.
This is a work of fiction for fans of sci-fi and horror.
`;

    setResult("Thinking Vjeai...");
    const generated = await generateText(promptTemplate);
    setResult(generated || "Failed to generate story. Try again.");
  };

  const addElement = (type) => {
    const id = Date.now().toString();
    const x = 100;
    const y = elements.length * 120 + 50;

    let newElement;
    if (type === "character") {
      newElement = {
        id,
        type,
        x,
        y,
        shape: "image",
        imgUrl: selectedHeroGif,
        width: 60,
        height: 60,
        label: "Character",
      };
    } else if (type === "scene") {
      newElement = {
        id,
        type,
        x,
        y,
        shape: "image",
        imgUrl: sceneImageSrc,
        width: 120,
        height: 80,
        label: "Scene",
      };
    } else if (type === "conflict") {
      newElement = {
        id,
        type,
        x,
        y,
        shape: "rect",
        width: 80,
        height: 50,
        fill: "#ffcc00",
        label: "Black Hole Nearby",
      };
    }
    setElements([...elements, newElement]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Sidebar */}
      <div className="w-64 p-4 bg-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Elements</h2>
        <label className="block mb-2 font-semibold text-gray-700">
          Select Hero Animation:
        </label>
        <select
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSelectedHeroGif(e.target.value)}
          value={selectedHeroGif}
        >
          {heroGifs.map((gif) => (
            <option key={gif.url} value={gif.url}>
              {gif.label}
            </option>
          ))}
        </select>

        <button
          className="w-full mb-2 p-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded transform transition-transform duration-150 hover:scale-105 active:scale-95"
          onClick={() => addElement("character")}
        >
          Add Character
        </button>
        <button
          className="w-full mb-2 p-2 bg-gradient-to-r from-cyan-400 to-teal-500 text-white rounded transform transition-transform duration-150 hover:scale-105 active:scale-95"
          onClick={() => addElement("scene")}
        >
          Add Scene
        </button>
        <button
          className="w-full mb-2 p-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded transform transition-transform duration-150 hover:scale-105 active:scale-95"
          onClick={() => addElement("conflict")}
        >
          Add Conflict
        </button>

        <textarea
          className="w-full p-2 border rounded mt-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter story prompt (e.g., A sci-fi adventure on Mars)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter a short conflict (3-5 words), e.g. "Black hole approaches"
        </p>

        <button
          className="w-full mt-2 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded transform transition-transform duration-150 hover:scale-105 active:scale-95"
          onClick={onGenerateClick}
        >
          Generate Story
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 overflow-auto">
        <Stage
          width={1600}
          height={1200}
          ref={stageRef}
          className="bg-white shadow-lg rounded"
          style={{ border: "1px solid #ccc" }}
        >
          <Layer>
            {elements.map((el) => {
              if (el.shape === "image") {
                const img = imageMap[el.id];
                return (
                  <React.Fragment key={el.id}>
                    {img && (
                      <>
                        <Image
                          id={el.id}
                          image={img}
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          draggable
                          onDragMove={(e) => handleDragMove(e, el.id)}
                          onClick={() => setSelectedId(el.id)}
                          stroke={selectedId === el.id ? "black" : null}
                          strokeWidth={2}
                        />
                        <Text
                          x={el.x}
                          y={el.y + el.height + 4}
                          width={el.width}
                          align="center"
                          text={el.label}
                          fontSize={12}
                          fill="#000"
                        />
                      </>
                    )}
                  </React.Fragment>
                );
              } else if (el.shape === "rect") {
                return (
                  <React.Fragment key={el.id}>
                    <Rect
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill={el.fill}
                      draggable
                      onDragMove={(e) => handleDragMove(e, el.id)}
                      onClick={() => setSelectedId(el.id)}
                      stroke={selectedId === el.id ? "black" : null}
                      strokeWidth={2}
                    />
                    <Text
                      x={el.x}
                      y={el.y + el.height / 4}
                      width={el.width}
                      align="center"
                      text={el.label}
                      fontSize={12}
                      fill="#000"
                    />
                  </React.Fragment>
                );
              }
              return null;
            })}
            {elements.map((el, i) =>
              i < elements.length - 1 ? (
                <Line
                  key={`line-${i}`}
                  points={[el.x, el.y, elements[i + 1].x, elements[i + 1].y]}
                  stroke="#555"
                  strokeWidth={2}
                  dash={[10, 5]}
                />
              ) : null
            )}
          </Layer>
        </Stage>
      </div>

      {/* Result Panel */}
      <div className="w-96 p-4 bg-white shadow-lg overflow-y-auto">
        <h2 className="text-xl font-bold mb-2 text-gray-700">Generated Story</h2>
        <div className="whitespace-pre-wrap text-gray-800">{result}</div>
      </div>
    </div>
  );
};

export default App;
