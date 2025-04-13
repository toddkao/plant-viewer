/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import styles from "./page.module.css";
import "@radix-ui/themes/styles.css";
import { Button, Dialog, Flex, TextField, Theme, Text, Table, TextArea } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import screenfull from 'screenfull';
import Papa from 'papaparse';

type Plant = {
  id?: number;
  "Common Name": string;
  "Remarks": "",
  "Botanical Name": string;
  "Height": string;
  "Spread": string;
  "Bloom": string;
  "Light": string;
  "Water": string;
  "Hardy Zone": string;
  "Image": string;
}

const plantFields: Plant = {
  "Common Name": "",
  "Botanical Name": "",
  "Remarks": "",
  "Height": "",
  "Spread": "",
  "Light": "",
  "Water": "",
  "Bloom": "",
  "Hardy Zone": "",
  "Image": "",
};

export default function Home() {

  const [open, setOpen] = useState(false);
  const openDialog = () => {
    setNewPlant(plantFields);
    setOpen(true);
  };
  const [plants, setPlants] = useState<Plant[]>([]);
  const [newPlant, setNewPlant] = useState<Plant>(plantFields);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantIndex, setSelectedPlantIndex] = useState<number | undefined>(undefined);

  const addOrSavePlant = async () => {
    if (newPlant.id) {
      await editPlant();
    } else {
      await addNewPlant();
    }
  }

  const addNewPlant = async () => {
    await savePlant(newPlant);
    const updatedPlants = await getAllPlants();
    setPlants(updatedPlants);
  }

  const editPlant = async () => {
    if (newPlant.id) {
      await editPlantById(newPlant.id, newPlant);
      const updatedPlants = await getAllPlants();
      setPlants(updatedPlants);
    }
  }

  const updateSearchQuery = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  const updateField = (e: ChangeEvent<HTMLInputElement>, field: keyof Plant) => {
    setNewPlant(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  useEffect(() => {
    getAllPlants().then(setPlants);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event);

      if ((event.target as any).id === "search-query") return;
      // Handle Escape to close the dialog
      if (event.key === 'Escape') {
        setOpen(false);
        setSelectedPlantIndex(undefined);
        return;
      }


      if (event.key === 'Enter' || event.code === "Space") {
        setSelectedPlantIndex(undefined);
        return;
      }

      // Skip modifier keys
      if (!event.key || event.metaKey || event.ctrlKey || event.altKey) return;

      // Only allow alphanumeric keys (A-Z, a-z, 0-9)
      if (!/^[a-zA-Z0-9]$/.test(event.key)) return;

      if (!open) {
        openDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewPlant(prev => ({
        ...prev,
        "Image": base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: { data: any; }) {
        console.log("Parsed CSV:", results.data);
        setPlants(results.data.map((data: any, index: number) => ({...data, id: index})));
      },
    });
  };

  const exportToCSV = (data: any[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plants.csv');
    link.click();
  };

  const deletePlant = async (id: number) => {
    await deletePlantById(id);
    const updatedPlants = await getAllPlants();
    setPlants(updatedPlants);
  };

  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      return plant["Common Name"].toLowerCase().includes(searchQuery) || plant["Botanical Name"].toLowerCase().includes(searchQuery);
    })
  }, [plants, searchQuery]);

  return (
    <Theme appearance="dark">
      <div className={styles.page}>
        <main className={styles.main}>
          <Button variant="ghost" style={{ fontSize: 30, height: "50px", width: "50px", position: 'fixed', right: 0, top: 0 }} onClick={() => {
            screenfull.request();
          }}>FS</Button>
          <Flex>
            <input type="file" accept=".csv" onChange={handleCSVUpload} />
            <Button onClick={() => exportToCSV(plants)}> Export as csv </Button>
          </Flex>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Button style={{ fontSize: 30, height: "50px" }} onClick={openDialog}>Add new plant</Button>
            <Dialog.Content size="4" maxWidth="1500px">
              <Dialog.Title style={{ fontSize: "25px" }}>Enter new plant details</Dialog.Title>

              <Flex direction="column" gap="3" wrap="wrap" style={{ maxHeight: "40vh" }}>
                {
                  Object.keys(plantFields).map(field => (
                    <Flex
                      key={field}
                      direction="column"
                    >
                      <label key={field}>
                        <Text as="div" size="4" mb="1" weight="bold">
                          {field}
                        </Text>
                        {
                          field === "Image" ? <>
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                            {newPlant["Image"] && (
                              <div style={{ marginTop: '1rem' }}>
                                <Image
                                  src={newPlant["Image"]}
                                  alt="Preview"
                                  style={{ borderRadius: '8px' }}
                                  height={200}
                                  width={200}
                                />
                              </div>
                            )}
                          </> : <TextField.Root
                            value={newPlant[field as keyof Plant]}
                            onChange={(e) => updateField(e, field as keyof Plant)}
                            style={{ fontSize: "20px" }}
                          />
                        }

                      </label>
                    </Flex>
                  ))
                }
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button onClick={() => setOpen(false)} variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button onClick={addOrSavePlant}>Save</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          <Dialog.Root open={selectedPlantIndex !== undefined} onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedPlantIndex(undefined);
          }}>
            <Dialog.Content maxWidth="100vw" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              padding: 0,
              overflow: "hidden",
              zIndex: 9999,
            }}>
              <Button variant="ghost" style={{ fontSize: 30, height: "50px", width: "50px", color: "red", position: 'fixed', right: 0, top: 0, }} onClick={() => {
                setSelectedPlantIndex(undefined);
              }}>X</Button>
              {
                plants?.[selectedPlantIndex as number] && <Flex direction="row" style={{ height: "100%" }}>
                  <div id="plant-image" style={{
                    backgroundImage: `url("${plants[selectedPlantIndex as number]?.["Image"]}")`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "50%",
                    height: "100%",
                    zIndex: 3,
                    flexShrink: 0,
                  }} />
                  <Flex direction="column" align="center" justify="center" style={{ width: "100%" }}>
                    <Text style={{ fontSize: 50, marginTop: "30px" }}> {plants?.[selectedPlantIndex as number]?.["Common Name"]} </Text>
                    <Text style={{ fontSize: 30, fontStyle: "italic", marginBottom: "30px" }}> {plants?.[selectedPlantIndex as number]?.["Botanical Name"]} </Text>
                    <div className={styles.leaf} />
                    <div style={{ zIndex: 3 }}>
                      <Image alt="decal" src="/leaf.png" height={50} width={150} />
                    </div>
                    <Text style={{ fontSize: 20, fontWeight: "bold", margin: "30px 0" }}> Plant Information </Text>
                    <Flex direction="column">
                      {
                        Object.entries(plants?.[selectedPlantIndex as number]).filter(([fieldName]) => !["Common Name", "Botanical Name", "id", "Image"].includes(fieldName)).map(([fieldName, fieldValue]) => (
                          <Flex key={fieldName} justify="start">
                            <Text style={{ fontSize: 20, fontWeight: "bold", marginRight: 20 }}> {fieldName}:</Text>
                            <Text style={{ fontSize: 20 }}>{fieldValue} </Text>
                          </Flex>
                        ))
                      }
                    </Flex>
                  </Flex>
                </Flex>
              }


            </Dialog.Content>
          </Dialog.Root>
          <div className={styles.searchQuery}>
            <TextArea id="search-query" value={searchQuery} onChange={updateSearchQuery} placeholder="Search for name or botanical name" />
          </div>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                {
                  Object.keys(plantFields).map(field => (<Table.ColumnHeaderCell key={field}>{field} </Table.ColumnHeaderCell>))
                }
                <Table.ColumnHeaderCell>Edit</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Delete</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredPlants.map((plant, index) => (
                <Table.Row key={index} onClick={() => setSelectedPlantIndex(index)} className={styles.tableRow}>
                  {Object.entries(plant).map(([fieldName, fieldValue]) => {
                    if (fieldName === "id") return;
                    if (fieldName === "Image") {
                      return (
                        <Table.Cell key={fieldName}>
                          <Image
                            src={fieldValue.toString()}
                            alt="Preview"
                            style={{ borderRadius: '8px' }}
                            height={50}
                            width={50}
                          />
                        </Table.Cell>
                      )
                    }
                    return <Table.Cell key={fieldName}>{fieldValue}</Table.Cell>;
                  })}

                  <Table.Cell
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plant.id !== undefined) {
                        setNewPlant(plant);
                        console.log(plant);
                        setOpen(true);
                      }
                    }}
                    style={{
                      fontSize: 18,
                      cursor: 'pointer',
                    }}
                  >
                    <div>✏️</div>
                  </Table.Cell>

                  <Table.Cell
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plant.id !== undefined) deletePlant(plant.id);
                    }}
                    style={{
                      fontSize: 18,
                    }}
                  >
                    <div>❌</div>
                  </Table.Cell>
                </Table.Row>
              )
              )}
            </Table.Body>
          </Table.Root>
        </main>
      </div>
    </Theme>
  );
}

const DB_NAME = "PlantDB";
const STORE_NAME = "plants";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = () => resolve(request.result);
  });
};

const savePlant = async (plant: any) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add(plant);
};

const deletePlantById = async (id: number) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
};

export const editPlantById = async (id: number, updatedPlant: Plant) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put({ ...updatedPlant, id });
};

const getAllPlants = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};