import React from 'react';
import { useParams } from 'react-router-dom';
import './styles.css'; // Assuming styles are defined in a separate CSS file

const CollectionPage = () => {
    const { collectionId } = useParams();

    // Simulated data fetching function
    const fetchCollectionData = async (id) => {
        // Replace this with actual data fetching logic
        return {
            title: `Collection ${id}`,
            description: 'Description for the collection.',
            items: [
                { id: 1, name: 'Item 1', image: 'url_to_image_1' },
                { id: 2, name: 'Item 2', image: 'url_to_image_2' },
                { id: 3, name: 'Item 3', image: 'url_to_image_3' }
            ]
        };
    };

    const [collection, setCollection] = React.useState(null);

    React.useEffect(() => {
        const loadCollection = async () => {
            const data = await fetchCollectionData(collectionId);
            setCollection(data);
        };

        loadCollection();
    }, [collectionId]);

    if (!collection) return <div>Loading...</div>;

    return (
        <div className="collection-page dark-theme">
            <header className="collection-header">
                <h1>{collection.title}</h1>
                <p>{collection.description}</p>
            </header>
            <main className="collection-items">
                <h2>Items</h2>
                <div className="items-grid">
                    {collection.items.map(item => (
                        <div key={item.id} className="item-card">
                            <img src={item.image} alt={item.name} />
                            <h3>{item.name}</h3>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CollectionPage;