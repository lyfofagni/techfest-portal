export default function Gallery() {
  const imgs = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div>
      <h2>Gallery</h2>
      <div className="gallery">
        {imgs.map(i => (
          <img key={i} src={`https://picsum.photos/id/${i + 10}/1600/1000`} />
        ))}
      </div>
    </div>
  );
}