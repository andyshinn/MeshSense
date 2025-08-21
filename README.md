# MeshSense

**MeshSense** is a simple, [open-source](https://github.com/Affirmatech/MeshSense) application that monitors, maps and graphically displays all the vital stats of your area's Meshtastic network including connected nodes, signal reports, trace routes and more!

![](https://affirmatech.com/meshsense.png)

MeshSense directly connects to your Meshtastic node via Bluetooth or WiFi and continuously provides all the information you need to assess the health of your network. For more detailed information, take a peek at our [Frequently Asked Questions](https://affirmatech.com/meshsense/faq) or [Bluetooth Tips](https://affirmatech.com/meshsense/bluetooth).

## Headless Usage

To run MeshSense without a GUI, use the `--headless` flag. Additionally the `ACCESS_KEY` environment variable can be used to specify the privileged access key for remote connections to gain full permissions.

```sh
export ADDRESS=10.0.1.20  # Address of Meshtastic Node
export PORT=5920          # Port of remote interface

ACCESS_KEY=mySecretKey ./meshsense-x86_64.AppImage --headless

# Alternative execution:
dbus-run-session xvfb-run ./meshsense-arm64.AppImage --headless \
 --disable-gpu --in-process-gpu --disable-software-rasterizer
```

See also [Headless FAQ](https://affirmatech.com/meshsense/faq#headless)

## Debian Dependencies

Ubuntu and Raspberry Pi OS users will need the following dependency installed to run the AppImage:

```sh
sudo apt install libfuse2
```

To display unicode symbols on the buttons, it may be helpful to install `fonts-noto-color-emoji`

```sh
sudo apt install fonts-noto-color-emoji
```

## Development Setup

To run MeshSense from the source code, first clone the MeshSense repo:

```sh
git clone --recurse-submodules https://github.com/Affirmatech/MeshSense.git
cd MeshSense
```

The `npm` tool will install the dependencies for `ui`, `api`, and `electron` directories.

```sh
npm install
```

During development, the electron portion is usually not needed. ou can start the UI and API services using:

```sh
npm run dev
```

The front-end should now be accessible by connecting to the **API** service in a browser. Be careful not to connect to the UI service by accident. The correct URL (API URL) is http://localhost:5920/

Any API changes will automatically reload the service. Any UI changes will be hot-reloaded by Vite.

**Please note:** currently certain event subscribers (particularly State variables) will duplicate their subscription when Vite hot-reloads resulting in duplicate events such as Log entries. Until this is fixed, the easiest solution is to refresh the browser to reset the events.

To build the `ui`, `api`, and `electron` components, the `npm run build` script will accomplish this. The official electron builds are signed with an Affirmatech certificate on our build servers. The deployables will be placed in `api/dist` and `electron/dist`.
