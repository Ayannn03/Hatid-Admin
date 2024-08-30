import  { useEffect, useState } from 'react';
import axios from 'axios';
import TabBar from '../tab-bar/TabBar';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/violate/violation';

const Violations = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [profileData] = useState(null);

    useEffect(() => {
        fetchViolation();
    }, []);

    const fetchViolation = async () => {
        try {
            const res = await axios.get(API_URL);
            console.log("Violation Data", res.data);

            if (res.data.status === "ok") {
                setData(res.data.data || []); 
            } else {
                console.error("Cannot find violation");
                setError("No violations found.");
            }
        } catch (error) {
            console.error('Error fetching violations:', error);
            setError("Error fetching data. Please try again later.");
        }
    };

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
                                    <p><strong>Booking:</strong> {profileData.booking}</p>
                                    <p><strong>Driver:</strong> {profileData.driver.name}</p>
                                    <p><strong>User:</strong> {profileData.user.name}</p>
                                    <p><strong>Report:</strong> {profileData.report}</p>
                                    <p><strong>Description:</strong> {profileData.description || 'N/A'}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h1 className='driver-list'>Violation List</h1>
            </div>
            <div className='drivers-table'>
                <table className='driver'>
                    <thead className='driver-container'>
                        <tr className='driver-content'>
              
                            <th>Booking</th>
                            <th>Driver</th>
                            <th>User</th>
                            <th>Report</th>
                            <th>Description</th>
      
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((violation) => (
                            <tr key={violation._id} className='driver-content'>
                      
                                <td>{violation.booking}</td>
                                <td>{violation.driver.name}</td>
                                <td>{violation.user.name}</td>
                                <td>{violation.report}</td>
                                <td>{violation.description || 'N/A'}</td>
                               
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
