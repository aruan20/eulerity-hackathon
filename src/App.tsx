import './App.css';
import type {Pet} from './Pet';
import { useState, useEffect } from 'react';
import styled from 'styled-components'
import {BsSearch} from 'react-icons/bs';
import {saveAs} from 'file-saver';

const Container = styled.div`
  width: 100%;
  margin-top: 20px;
`
const SideBar = styled.div`
  float: left;
  text-align: left;
  margin-left: 30px;
`
const Input = styled.input`
  width: 50%;
  padding: 10px;
  margin-right: 20px;
  border-radius: 5px;
`
const Selections = styled.ul`
  list-style: none;
`
const Button = styled.button`
  border-radius: 25px;
  border-color: white;
  background-color: transparent;
  color: white;
  margin-left: 10px;
`
const List = styled.ul`
  width: 75%;
  float: right;
  list-style: none;
  flex-wrap: wrap;
  display: flex;
  height: 90vh;
  overflow: auto;
  `
const ListItem = styled.li <{ $clicked?: string;}>`
  flex: 1 1 30%;
  border: solid;
  border-color: white;
  border-radius: 25px;
  padding: 5px;
  margin-right: 20px;
  margin-bottom: 20px;
  text-align: center;
`

/*
  Function: isPet()
  Parameters: 1 argument (unspecified type)
  Purpose: check if argument is a "Pet" object
  Return: true if argument is a Pet, false otherwise
*/
export function isPet(value: unknown):value is Pet{
  // check if there is no info (value = false) or if info can be accessed
  if (!value || typeof value !== 'object'){
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.created === 'string'
  )
}

/*
  Function: isPetsArray()
  Parameters: 1 argument (unspecified array)
  Purpose: check if array is an array of "Pet" objects
  Return: true if argument is a Pet[], false otherwise
*/
export function isPetsArray(value: unknown):value is Pet[]{
  return Array.isArray(value) && value.every(isPet)
}

/*
  Function: getPets()
  Parameters: none
  Purpose: retrieve information from JSON file
  Return: Pet[]
*/
export async function getPets(){
  // get data using fetch (set to "GET" method by default)
  const request = await fetch('https://eulerity-hackathon.appspot.com/pets')
  const data = await request.json()

  // check if data consists of Pet objects
  if (!isPetsArray(data)){
    throw new Error('Invalid data: array with pets expected')
  }

  return data
}


function App() {
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [copyPets, setCopyPets] = useState<Pet[]>([]);
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [sortedPets, setSortedPets] = useState<Pet[]>([]);
  const [searchVal, setSearchVal] = useState("");
  useEffect(() => {
    getPets().then(result => {
      setPets(result);
      setCopyPets(result);
    });
  }, []);


  return (
    <div className="App">
      <Container>
        <Input placeholder="Filter by title or description" 
               onChange={e => setSearchVal(e.target.value)}></Input>
        <BsSearch onClick={() => {
          if (searchVal === "") {
            setPets(copyPets);
          }
          else{
            setPets(copyPets.filter(a => 
              a.title.toLowerCase().includes(searchVal.toLowerCase()) || 
              a.description.toLowerCase().includes(searchVal.toLowerCase())
            ));
          }
          
        }} />
      </Container>
      <Container>
        <SideBar>
          Selections
          <Selections>
            {selectedPets.map((pet,index) =>
              <li key={index}>{pet.title}</li>
            )}
          </Selections>
          <Button onClick={() =>
            setSelectedPets(pets)
          }>Select All</Button>
          <Button onClick={() =>
            setSelectedPets([])
          }>Clear Selection</Button>
          <br></br>
          <Button onClick={() =>{
            console.log(selectedPets)
            selectedPets.map((pet) => 
              saveAs(pet.url, pet.title)
            )
          }}>Download Images</Button>
          <br></br>
          <br></br>
          Sort By
          <div>
            <input type="radio" value="A-Z" name="sortby" onChange={() => {
              setPets(oldPets => oldPets.sort((a,b) => {
                  if (a.title < b.title) {return -1;}
                  if (a.title > b.title) {return 1;}
                  return 0;
                })
              );
              setSortedPets(pets); // force render
              }}
            /> A-Z
            <br></br>
            <input type="radio" value="Z-A" name="sortby" onChange={() => {
              setPets(oldPets => oldPets.sort((a,b) => {
                  if (a.title > b.title) {return -1;}
                  if (a.title < b.title) {return 1;}
                  return 0;
                })
              );
              setSortedPets([]); // force render
              }}
            /> Z-A
          </div>
        </SideBar>
        <List>
          {pets.map((pet, index) => 
            <ListItem key={index} onClick={() => {
              if (selectedPets.includes(pet)){
                setSelectedPets(selectedPets.filter(a => a.title !== pet.title));
              }
              else{
                setSelectedPets([...selectedPets, pet])
              }
            }}>
              <h3>{pet.title}</h3>
              <img src={pet.url} alt="image of pet" height="200px"/>
              <p>{pet.description}</p>
              <h6>{pet.created}</h6>
            </ListItem>
          )}
        </List>
      </Container>
    </div>
  );
}

export default App;
