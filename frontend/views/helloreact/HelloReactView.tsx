import { Button } from '@hilla/react-components/Button.js';
import { ComboBox } from '@hilla/react-components/ComboBox.js';
import { DatePicker } from '@hilla/react-components/DatePicker.js';
import { NumberField } from '@hilla/react-components/NumberField.js';
import { TextField } from '@hilla/react-components/TextField.js';
import { useField, useBinder } from 'Frontend/form/binder.js';
import { FormEndpoint } from 'Frontend/generated/endpoints';
import EntityModel from 'Frontend/to-be-generated/com/example/application/endpoints/helloreact/FormEndpoint/EntityModel';
import { useState } from 'react';

const comboBoxItems = ['foo', 'bar'];

export default function FormView() {
  const [ name, setName ] = useState('');

  const { binder, field } = useBinder(EntityModel, {onSubmit: FormEndpoint.sendEntity});

  return (
    <>
      <section className="flex p-m gap-m items-baseline">
        <TextField label="Name" {...field(binder.model.name)}></TextField>
        <ComboBox label="Choose" {...field(binder.model.choice)} items={comboBoxItems}></ComboBox>
        <NumberField label="Number" {...field(binder.model.number)}></NumberField>
        <DatePicker label="Date" {...field(binder.model.date)}></DatePicker>
        <Button onClick={() => binder.submit()}>submit</Button>
      </section>
    </>
  );
}
