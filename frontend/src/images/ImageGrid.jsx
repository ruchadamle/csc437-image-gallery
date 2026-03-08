import "./Images.css";
import { Link } from "react-router";

export function ImageGrid(props) {
    const imageElements = props.images.map((image) => (
        <div key={String(image._id ?? image.id)} className="ImageGrid-photo-container">
            <Link to={"/images/" + String(image._id ?? image.id)}>
                <img src={image.src} alt={image.name}/>
            </Link>
        </div>
    ));
    return (
        <div className="ImageGrid">
            {imageElements}
        </div>
    );
}
