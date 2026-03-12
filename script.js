#dashboard {
    background: transparent; /* Keep the canvas particles visible */
    pointer-events: auto;
    text-align: center;
    color: var(--secondary-color);
}

.time-container h1 {
    font-size: 8rem;
    margin-bottom: 0;
    font-family: var(--font-ui); /* Switch to Inter for a modern look */
    font-weight: 800;
}

#liveDate {
    font-family: var(--font-ui);
    font-size: 1.5rem;
    opacity: 0.7;
    margin-bottom: 3rem;
}

.weather-container {
    font-family: var(--font-ui);
    margin-bottom: 3rem;
}

#weatherTemp {
    font-size: 3rem;
    font-weight: 600;
}

.focus-box input {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-bottom: 2px solid var(--secondary-color);
    color: var(--secondary-color);
    font-family: var(--font-ui);
    font-size: 1.2rem;
    padding: 10px;
    width: 300px;
    text-align: center;
    outline: none;
}
