import Page from './page.js';
import interact from 'https://cdn.skypack.dev/interactjs';

async function createPage(url, config, pos) {
    const page = new Page(url, config, pos);

    page.el = document.createElement('div');
    const opt = document.createElement('div');
    const mv = document.createElement('div');
    const omni = document.createElement('input');
    const ifr = document.createElement('iframe');
    const cl = document.createElement('button');

    page.el.classList.add('page');
    opt.classList.add('options');
    mv.classList.add('handle');
    omni.classList.add('omnibar');
    ifr.classList.add('content');
    cl.classList.add('close');

    omni.innerText = 'about:blank';
    ifr.src = "/new.html"

    opt.appendChild(mv);
    opt.appendChild(cl);
    opt.appendChild(omni);

    page.el.appendChild(opt);
    page.el.appendChild(ifr);

    document.body.appendChild(page.el);

    createListeners(page.el);

    return;
}

async function createListeners(el) {
    let currentX = 0;
    let currentY = 0;
    let angle = 0;
    let targetAngle = 0;
    let animationFrame = null;
    console.log(el);

    const handle = el.querySelector('.handle');

    // Prevent text highlighting during drag
    let userSelectBackup = '';

    interact(el).draggable({
        allowFrom: handle,
        listeners: {
            start() {
                userSelectBackup = document.body.style.userSelect;
                document.body.style.userSelect = 'none';
                document.querySelectorAll('.content').forEach((iframe) => { iframe.style.pointerEvents = 'none'; });
            },
            move(event) {
                currentX += event.dx;
                currentY += event.dy;

                targetAngle = Math.max(-3, Math.min(3, event.dx * 0.3));

                requestTick();
            },
            end() {
                document.body.style.userSelect = userSelectBackup;
                document.querySelectorAll('.content').forEach((iframe) => { iframe.style.pointerEvents = 'auto'; });
                targetAngle = 0;
                requestTick();
            }
        },
        inertia: true
    });

    function requestTick() {
        if (!animationFrame) {
            animationFrame = requestAnimationFrame(update);
        }
    }

    function update() {
        angle += (targetAngle - angle) * 0.15;

        el.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${angle}deg)`;

        if (Math.abs(targetAngle - angle) > 0.1) {
            animationFrame = requestAnimationFrame(update);
        } else {
            angle = targetAngle;
            el.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${angle}deg)`;
            animationFrame = null;
        }
    }
}


export { createPage };