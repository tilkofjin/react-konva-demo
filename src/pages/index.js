import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer, Image } from 'react-konva';
import useImage from 'use-image';

// 选中矩形组件
const Rectangle = ({
  shapeProps,
  draggable,
  isSelected,
  onSelect,
  onChange,
  onDblClick,
  onDblTap,
}) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        draggable={draggable}
        onDblClick={onDblClick}
        onDblTap={onDblTap}
        ref={shapeRef}
        fill="transparent"
        {...shapeProps}
        onDragEnd={e => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const scale = window.innerWidth > 1080 ? 1 : window.innerWidth / window.innerHeight;

const initialRectangles = [
  {
    x: 90 * scale,
    y: 60 * scale,
    width: 100 * scale,
    height: 100 * scale,
    name: 'rect',
    // fill: 'red',
    stroke: 'red',
    strokeWidth: 5 * scale,
    id: 'rect1',
  },
  {
    x: 210 * scale,
    y: 60 * scale,
    width: 100 * scale,
    height: 100 * scale,
    name: 'rect',
    // fill: 'green',
    stroke: 'green',
    strokeWidth: 5 * scale,
    id: 'rect2',
  },
];

const initCircle = [
  {
    x: 250 * scale,
    y: 120 * scale,
    name: 'circle',
    fill: 'red',
    radius: 20 * scale,
    id: 'circle1',
  },
];

const initTextList = [
  {
    x: 125 * scale,
    y: 100 * scale,
    fill: 'blue',
    fontSize: 15 * scale,
    draggable: true,
    textEditVisible: false,
    textValue: '卧室',
    width: 100 * scale,
    fontStyle: 'normal',
    align: 'left',
    id: 0,
  },
];

export default function() {
  const stageRef = useRef(null);
  const [circleList, setCircleList] = useState(initCircle);
  const [textList, setTextList] = useState(initTextList);
  const [curTextIndex, setCurTextIndex] = useState(0);
  const [image] = useImage('https://www.as886.com/uploads/allimg/210725/061T52111-0.jpg');
  const [selectedId, selectShape] = useState(null);
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [newRectangles, setNewRectangles] = useState([]);

  const handleMouseDown = e => {
    // deselect when clicked on empty area
    const { x, y } = e.target.getStage().getPointerPosition();
    if (!newRectangles.length) {
      setNewRectangles([{ x, y, width: 0, height: 0, key: "0" }]);
    }
  };

  const handleMouseMove = e => {
    if (newRectangles.length === 1) {
      const sx = newRectangles[0].x;
      const sy = newRectangles[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      const len = rectangles.length + 1;
      setNewRectangles([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          name: 'rect',
          stroke: 'red',
          strokeWidth: 5 * scale,
          id: `rect${len}`,
        },
      ]);
    }
  };

  const handleMouseUp = e => {
    if (newRectangles.length === 1) {
      const sx = newRectangles[0].x;
      const sy = newRectangles[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      const len = rectangles.length + 1;
      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        name: 'rect',
        stroke: 'red',
        strokeWidth: 5 * scale,
        id: `rect${len}`,
      };
      rectangles.push(annotationToAdd);
      setNewRectangles([]);
      setRectangles(rectangles);
      console.log("🚀 ~ file: index.js ~ line 204 ~ function ~ rectangles", rectangles)
    }
  };

  const handleTouchStart = e => {
    console.log('🚀 ~ file: index.js ~ line 143 ~ handleTouchStart ~ e', e);
  };

  const handleTouchEnd = e => {
    const attrs = e.target.getAttrs();
    console.log('🚀 ~ file: index.js ~ line 132 ~ function ~ attrs', attrs);
    if (attrs?.name !== 'rect') {
      selectShape(null);
    }
  };

  const downloadURI = (uri, name) => {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onChange = e => {
    console.log('🚀 ~ file: index.js ~ line 114 ~ function ~ e', e);
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    console.log(uri);
    downloadURI(uri, 'stage.png');
  };

  const handleAddRect = () => {
    const length = rectangles.length;
    const rect = {
      name: 'rect',
      x: 10 * scale,
      y: 200 * scale,
      width: 100 * scale,
      height: 100 * scale,
      stroke: 'red',
      strokeWidth: 5,
      id: `rect${length + 1}`,
    };
    setRectangles([...rectangles, rect]);
  };

  const handleAddCircle = () => {
    const length = circleList.length;
    const circle = {
      x: 100 * scale,
      y: 100 * scale,
      name: 'circle',
      fill: 'red',
      radius: 20 * scale,
      id: `circle${length}`,
    };
    setCircleList([...circleList, circle]);
  };

  // 点击⚪时的动画
  const pulseShape = shape => {
    // use Konva methods to animate a shape
    shape.to({
      scaleX: 1.5,
      scaleY: 1.5,
      onFinish: () => {
        shape.to({
          scaleX: 1,
          scaleY: 1,
        });
      },
    });
  };

  const handleCircleClick = e => {
    // another way to access Konva nodes is to just use event object
    const shape = e.target;
    console.log('🚀 ~ file: index.js ~ line 218 ~ handleCircleClick ~ shape', shape);
    pulseShape(shape);
    // prevent click on stage
    e.cancelBubble = true;
  };

  const handleTextEdit = e => {
    const value = e.target.value;
    console.log('🚀 ~ file: index.js ~ line 259 ~ function ~ curTextIndex', curTextIndex);
    textList[curTextIndex].textValue = value;
    const newTextList = textList.map((item, index) => item);
    setTextList(newTextList);
  };

  const handleTextareaKeyDown = e => {
    if (e.keyCode === 13) {
      const newTextList = textList.map((item, index) => {
        return {
          ...item,
          textEditVisible: index === curTextIndex ? false : true,
        };
      });
      setTextList(newTextList);
    }
  };

  const handleTextDblClick = (e, i) => {
    setCurTextIndex(i);
    const absPos = e.target.getAbsolutePosition();
    const newTextList = textList.map((item, index) => {
      return {
        ...item,
        textEditVisible: !item.textEditVisible,
        x: index === i ? absPos.x : item.x,
        y: index === i ? absPos.y : item.y,
      };
    });
    setTextList(newTextList);
  };

  const drawRectList = [...rectangles, ...newRectangles];
  console.log('🚀 ~ file: index.js ~ line 334 ~ function ~ drawRectList', drawRectList);

  return (
    <>
      <button onClick={handleExport} onTouchEnd={handleExport}>
        下载图片
      </button>
      <button onClick={handleAddRect}>新增矩形</button>
      <button onClick={handleAddCircle}>新增圆形</button>
      <Stage
        ref={stageRef}
        width={window.innerHeight * scale}
        height={window.innerHeight * scale}
        // onMouseDown={handleMouseDown}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleMouseMove}
        // onTouchEnd={handleTouchEnd}
        // onMousemove={handleMouseMove}
        // onMouseup={handleMouseUp}
        onClick={e => {
          const attrs = e.target.getAttrs();
          if (!attrs?.id) {
            selectShape(null);
          }
        }}
      >
        <Layer>
          <Image
            image={image}
            draggable
            x={0}
            y={0}
            width={500 * scale}
            height={500 * scale}
            onChange={onChange}
          />

          {drawRectList.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                draggable
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={e => {
                  selectShape(rect.id);
                }}
                onDblClick={() => {
                  const rects = rectangles.filter(item => item.id !== selectedId);
                  setRectangles(rects);
                }}
                onDblTap={() => {
                  const rects = rectangles.filter(item => item.id !== selectedId);
                  setRectangles(rects);
                }}
                onChange={newAttrs => {
                  const rects = rectangles.slice();
                  rects[i] = newAttrs;
                  setRectangles(rects);
                }}
              />
            );
          })}
          {circleList.map((circle, i) => (
            <Circle
              key={i}
              {...circle}
              fill={circle.fill}
              onClick={handleCircleClick}
              onTap={handleCircleClick}
              draggable
            />
          ))}
          {textList.map((text, i) => (
            <Text
              key={i}
              {...text}
              align={'left'}
              fontStyle={20}
              draggable
              text={text.textValue}
              wrap="word"
              width={text.width}
              onDblTap={e => handleTextDblClick(e, i)}
              onDblClick={e => handleTextDblClick(e, i)}
            />
          ))}
        </Layer>
      </Stage>
      {textList.map((text, i) => (
        <textarea
          key={i}
          value={text.textValue}
          style={{
            display: text.textEditVisible ? 'block' : 'none',
            position: 'absolute',
            left: text.x + 'px',
            top: text.y + 'px',
          }}
          onChange={e => handleTextEdit(e)}
          onKeyDown={e => handleTextareaKeyDown(e)}
        />
      ))}
    </>
  );
}
