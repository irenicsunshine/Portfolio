// Add these new animation functions to your existing script

function createMobileAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'mobile-animation';
    
    const phoneMockup = document.createElement('div');
    phoneMockup.className = 'phone-mockup';
    
    const phoneScreen = document.createElement('div');
    phoneScreen.className = 'phone-screen';
    
    // Create floating app icons
    for (let i = 0; i < 8; i++) {
        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon';
        appIcon.style.left = (i % 3) * 40 + 20 + 'px';
        appIcon.style.top = Math.floor(i / 3) * 50 + 30 + 'px';
        appIcon.style.animationDelay = (i * 0.3) + 's';
        phoneScreen.appendChild(appIcon);
    }
    
    phoneMockup.appendChild(phoneScreen);
    animationDiv.appendChild(phoneMockup);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createGameAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'game-animation';
    
    const gameController = document.createElement('div');
    gameController.className = 'game-controller';
    
    // Add game buttons
    for (let i = 0; i < 4; i++) {
        const button = document.createElement('div');
        button.className = 'game-button';
        button.style.animationDelay = (i * 0.3) + 's';
        gameController.appendChild(button);
    }
    
    animationDiv.appendChild(gameController);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createSecurityAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'security-animation';
    
    const shieldContainer = document.createElement('div');
    shieldContainer.className = 'shield-container';
    
    const shield = document.createElement('div');
    shield.className = 'security-shield';
    
    const lock = document.createElement('div');
    lock.className = 'security-lock';
    
    shield.appendChild(lock);
    shieldContainer.appendChild(shield);
    animationDiv.appendChild(shieldContainer);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createBlockchainAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'blockchain-animation';
    
    const blockchainContainer = document.createElement('div');
    blockchainContainer.className = 'blockchain-container';
    
    // Create blockchain blocks
    for (let i = 0; i < 4; i++) {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.animationDelay = (i * 0.5) + 's';
        blockchainContainer.appendChild(block);
        
        if (i < 3) {
            const chainLink = document.createElement('div');
            chainLink.className = 'chain-link';
            chainLink.style.animationDelay = (i * 0.5 + 0.25) + 's';
            blockchainContainer.appendChild(chainLink);
        }
    }
    
    animationDiv.appendChild(blockchainContainer);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createIoTAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'iot-animation';
    
    const iotNetwork = document.createElement('div');
    iotNetwork.className = 'iot-network';
    
    // Create IoT devices in a network pattern
    const devicePositions = [
        {x: 150, y: 50}, {x: 250, y: 100}, {x: 200, y: 200},
        {x: 100, y: 200}, {x: 50, y: 150}, {x: 150, y: 150}
    ];
    
    devicePositions.forEach((pos, index) => {
        const device = document.createElement('div');
        device.className = 'iot-device';
        device.style.left = pos.x + 'px';
        device.style.top = pos.y + 'px';
        device.style.animationDelay = (index * 0.3) + 's';
        iotNetwork.appendChild(device);
        
        // Add connections between devices
        if (index < devicePositions.length - 1) {
            const connection = document.createElement('div');
            connection.className = 'iot-connection';
            connection.style.left = pos.x + 'px';
            connection.style.top = pos.y + 'px';
            connection.style.width = '50px';
            connection.style.animationDelay = (index * 0.2) + 's';
            iotNetwork.appendChild(connection);
        }
    });
    
    animationDiv.appendChild(iotNetwork);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createDataScienceAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'datascience-animation';
    
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    // Create animated chart bars
    for (let i = 0; i < 8; i++) {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.left = (i * 30) + 'px';
        bar.style.setProperty('--chart-height', Math.random() * 120 + 40 + 'px');
        bar.style.animationDelay = (i * 0.2) + 's';
        chartContainer.appendChild(bar);
    }
    
    // Add data points
    for (let i = 0; i < 15; i++) {
        const point = document.createElement('div');
        point.className = 'data-point';
        point.style.left = Math.random() * 230 + 'px';
        point.style.top = Math.random() * 150 + 'px';
        point.style.animationDelay = Math.random() * 2 + 's';
        chartContainer.appendChild(point);
    }
    
    animationDiv.appendChild(chartContainer);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createTestingAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'testing-animation';
    
    const testSuite = document.createElement('div');
    testSuite.className = 'test-suite';
    
    // Create test cases
    const testNames = ['Login Test', 'API Test', 'UI Test', 'Security Test', 'Performance Test'];
    testNames.forEach((testName, index) => {
        const testCase = document.createElement('div');
        testCase.className = 'test-case';
        testCase.style.animationDelay = (index * 0.5) + 's';
        testSuite.appendChild(testCase);
    });
    
    animationDiv.appendChild(testSuite);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createDesignAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'design-animation';
    
    const designCanvas = document.createElement('div');
    designCanvas.className = 'design-canvas';
    
    // Create design elements
    const rect = document.createElement('div');
    rect.className = 'design-element design-rect';
    rect.style.top = '50px';
    rect.style.left = '30px';
    rect.style.animationDelay = '0s';
    
    const circle = document.createElement('div');
    circle.className = 'design-element design-circle';
    circle.style.top = '100px';
    circle.style.right = '30px';
    circle.style.animationDelay = '1s';
    
    designCanvas.appendChild(rect);
    designCanvas.appendChild(circle);
    animationDiv.appendChild(designCanvas);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}

function createHardwareAnimation(skillName) {
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'hardware-animation';
    
    const circuitBoard = document.createElement('div');
    circuitBoard.className = 'circuit-board';
    
    // Create circuit lines
    const lines = [
        {width: '100px', height: '2px', top: '50px', left: '20px'},
        {width: '2px', height: '80px', top: '50px', left: '120px'},
        {width: '80px', height: '2px', top: '130px', left: '120px'},
        {width: '2px', height: '50px', top: '130px', left: '200px'}
    ];
    
    lines.forEach((line, index) => {
        const circuitLine = document.createElement('div');
        circuitLine.className = 'circuit-line';
        circuitLine.style.width = line.width;
        circuitLine.style.height = line.height;
        circuitLine.style.top = line.top;
        circuitLine.style.left = line.left;
        circuitLine.style.animationDelay = (index * 0.3) + 's';
        circuitBoard.appendChild(circuitLine);
    });
    
    // Create circuit nodes
    const nodes = [
        {top: '42px', left: '12px'},
        {top: '42px', left: '112px'},
        {top: '122px', left: '112px'},
        {top: '122px', left: '192px'}
    ];
    
    nodes.forEach((node, index) => {
        const circuitNode = document.createElement('div');
        circuitNode.className = 'circuit-node';
        circuitNode.style.top = node.top;
        circuitNode.style.left = node.left;
        circuitNode.style.animationDelay = (index * 0.4) + 's';
        circuitBoard.appendChild(circuitNode);
    });
    
    animationDiv.appendChild(circuitBoard);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    container.appendChild(animationDiv);
    container.appendChild(closeBtn);
    container.appendChild(title);
    
    return container;
}
