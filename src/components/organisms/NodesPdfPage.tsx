interface NodesPdfPageProps {
  image: string;
}
const NodesPdfPage = ({ image }: NodesPdfPageProps) => {
  return (
    <div>
      <img src={image} />
    </div>
  );
};

export default NodesPdfPage;
