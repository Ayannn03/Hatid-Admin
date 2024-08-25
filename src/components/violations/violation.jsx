import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TabBar from '../tab-bar/tabBar';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/violate/violation';

const Violations = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [nameSearch, setNameSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL);
            const dataWithId = response.data.map((item, index) => ({ ...item, id: index + 1 }));
            setData(dataWithId);
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Error fetching data");
        }
    };

    const handleViewProfile = (id) => {
        const itemToView = data.find((item) => item.id === id);
        setProfileData(itemToView);
        setShowModal(true);
    };

    const handleSearch = (e) => {
        setNameSearch(e.target.value);
    };

    const filteredData = data.filter((item) =>
        item.driver.toLowerCase().includes(nameSearch.toLowerCase())
    );

    return (
        <div className='driver-main-content'>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                            {profileData && (
                                <>
                                    <h2>Profile Details</h2>
                                    <p><strong>ID:</strong> {profileData._id}</p>
                                    <p><strong>Booking:</strong> {profileData.booking}</p>
                                    <p><strong>Driver:</strong> {profileData.driver}</p>
                                    <p><strong>User:</strong> {profileData.user}</p>
                                    <p><strong>Report:</strong> {profileData.report}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h1 className='driver-list'>Violation List</h1>
            </div>
            <div className="search-bar-container">
                <input
                    className="input-design"
                    type="text"
                    placeholder="Search"
                    value={nameSearch}
                    onChange={handleSearch}
                />
            </div>
            <div className='drivers-table'>
                <table className='driver'>
                    <thead className='driver-container'>
                        <tr className='driver-content'>
                            <th>ID</th>
                            <th>Booking</th>
                            <th>Driver</th>
                            <th>User</th>
                            <th>Report</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.booking}</td>
                                <td>{item.driver}</td>
                                <td>{item.user}</td>
                                <td>{item.report}</td>
                                <td>
                                    <button className="view-button" onClick={() => handleViewProfile(item.id)}>View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {error && <div className="error-message">{error}</div>}
                <TabBar />
            </div>
        </div>
    );
};

export default Violations;
