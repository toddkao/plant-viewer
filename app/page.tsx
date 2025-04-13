/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import styles from "./page.module.css";
import "@radix-ui/themes/styles.css";
import { Button, Dialog, Flex, TextField, Theme, Text, Table, Box, TextArea } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Plant = {
  id?: number;
  "Common Name": string;
  "Botanical Name": string;
  "Propagation": string;
  "Height": string;
  "Spread": string;
  "Flower Colour": string;
  "Blooms": string;
  "Sunlight Requirement": string;
  "Water Requirements": string;
  "Zone": string;
  "Image": string;
}

const plantFields: Plant = {
  "Common Name": "",
  "Flower Colour": "",
  "Botanical Name": "",
  "Blooms": "",
  "Propagation": "",
  "Sunlight Requirement": "",
  "Height": "",
  "Water Requirements": "",
  "Spread": "",
  "Zone": "",
  "Image": "",
};

export default function Home() {

  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [newPlant, setNewPlant] = useState<Plant>(plantFields);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantIndex, setSelectedPlantIndex] = useState<number | undefined>(undefined);

  const addNewPlant = async () => {
    await savePlant(newPlant);
    const updatedPlants = await getAllPlants();
    setPlants(updatedPlants);
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
    if (open === true) {
      setNewPlant(plantFields);
    }
  }, [open]);

  useEffect(() => {
    getAllPlants().then(setPlants);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.target as any).id === "search-query") return;
      // Handle Escape to close the dialog
      if (event.key === 'Escape') {
        setOpen(false);
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
    <Theme>
      <div className={styles.page}>
        <main className={styles.main}>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
              <Button>Add new plant</Button>
            </Dialog.Trigger>
            <Dialog.Content size="4" maxWidth="1500px">
              <Dialog.Title style={{ fontSize: "25px" }}>Enter new plant details</Dialog.Title>

              <Flex direction="row" gap="3" wrap="wrap">
                {
                  Object.keys(plantFields).map(field => (
                    <Flex
                      key={field}
                      direction="column"
                      style={{ width: 'calc(50% - 0.5rem)' }} // 2 columns with gap
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
                                <img
                                  src={newPlant["Image"]}
                                  alt="Preview"
                                  style={{ width: '200px', borderRadius: '8px' }}
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
                  <Button onClick={addNewPlant}>Save</Button>
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
              backgroundColor: 'white',
              overflow: "hidden",
              zIndex: 9999,
            }}>
              {
                plants?.[selectedPlantIndex as number] && <Flex direction="row" style={{ height: "100%" }}>
                  <div style={{
                    backgroundImage: `url("${plants[selectedPlantIndex as number]?.["Image"]}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "50%",
                    height: "100%",
                    zIndex: 3,
                  }} />
                  <Flex direction="column" align="center" justify="center" style={{ width: "100%" }}>
                    <Text style={{ fontSize: 50, margin: "30px 0"}}> {plants?.[selectedPlantIndex as number]?.["Common Name"]} </Text>
                    <div className={styles.leaf} />
                    <div style={{ zIndex: 3 }}>
                      <img src="/leaf.png" height="50px" />
                    </div>
                    <Text style={{ fontSize: 20, fontWeight: "bold", margin: "30px 0"}}> Plant information </Text>
                    <Flex direction="column" style={{ width: 800, overflow: 'visible', textWrap: "nowrap" }}>
                      { 
                        Object.entries(plants?.[selectedPlantIndex as number]).filter(([fieldName]) => !["Common Name", "id", "Image"].includes(fieldName)).map(([fieldName, fieldValue]) => (
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

          <Box>
            <TextArea id="search-query" size="3" value={searchQuery} onChange={updateSearchQuery} placeholder="Search for name or botanical name" />
          </Box>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                {
                  Object.keys(plantFields).map(field => (<Table.ColumnHeaderCell key={field}>{field} </Table.ColumnHeaderCell>))
                }
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
                          <img
                            src={fieldValue}
                            alt="Preview"
                            style={{ height: '50px', borderRadius: '8px' }}
                          />
                        </Table.Cell>
                      )
                    }
                    return <Table.Cell key={fieldName}>{fieldValue}</Table.Cell>;
                  })}
                  <Table.Cell onClick={(e) => {
                    e.stopPropagation();
                    if (plant.id !== undefined) deletePlant(plant.id);
                  }} style={{ fontSize: 30, display: 'flex', alignItems: "center", justifyContent: "center", height: "100%", cursor: "pointer", color: "red" }}> X </Table.Cell>
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

export const openDB = (): Promise<IDBDatabase> => {
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

export const savePlant = async (plant: any) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add(plant);
};

export const deletePlantById = async (id: number) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
};

export const getAllPlants = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};