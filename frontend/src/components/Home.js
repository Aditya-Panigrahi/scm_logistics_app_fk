import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleNavigateToInbound = () => {
        navigate('/inbound');
    };

    const handleNavigateToOutbound = () => {
        navigate('/outbound');
    };

    const handleNavigateToReconciliation = () => {
        navigate('/status-reconciliation');
    };

    return (
        <div className="home-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo">
                            Flipkart
                            <span className="logo-tagline">SCM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="home-content">
                {/* Snowflakes Animation */}
                <div className="snowflakes" aria-hidden="true">
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                </div>

                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="christmas-icon">🎄</div>
                    <h1 className="welcome-title">
                        Welcome to SCM Logistics
                    </h1>
                    <p className="welcome-subtitle">
                        Merry Christmas & Happy Holidays! 🎅
                    </p>
                    <p className="welcome-description">
                        Streamline your warehouse operations with our comprehensive logistics management system
                    </p>
                </div>

                {/* App Grid */}
                <div className="apps-section">
                    <h2 className="section-title">Select an Application</h2>
                    <div className="apps-grid">
                        {/* Inbound App Card */}
                        <div 
                            className="app-card inbound-card" 
                            onClick={handleNavigateToInbound}
                        >
                            <div className="app-icon">
                                📦
                            </div>
                            <h3 className="app-name">Inbound Process</h3>
                            <p className="app-description">
                                Scan and assign packages to bins
                            </p>
                            <div className="app-badge">Active</div>
                        </div>

                        {/* Status Reconciliation App Card */}
                        <div 
                            className="app-card reconciliation-card" 
                            onClick={handleNavigateToReconciliation}
                        >
                            <div className="app-icon">
                                ✅
                            </div>
                            <h3 className="app-name">Status Reconciliation</h3>
                            <p className="app-description">
                                Upload manifest and update shipment status
                            </p>
                            <div className="app-badge">Active</div>
                        </div>

                        {/* Outbound App Card */}
                        <div 
                            className="app-card outbound-card" 
                            onClick={handleNavigateToOutbound}
                        >
                            <div className="app-icon">
                                🚚
                            </div>
                            <h3 className="app-name">Outbound Process</h3>
                            <p className="app-description">
                                Locate and pick up packages for dispatch
                            </p>
                            <div className="app-badge">Active</div>
                        </div>

                        {/* Other Apps Card - Coming Soon */}
                        <div className="app-card other-apps-card disabled">
                            <div className="app-icon">
                                🎯
                            </div>
                            <h3 className="app-name">Other Apps</h3>
                            <p className="app-description">
                                More features and tools
                            </p>
                            <div className="app-badge coming-soon">Coming Soon</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="home-footer">
                    <p>© 2025 Flipkart SCM Logistics. Built with ❤️ for efficient warehouse management.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
