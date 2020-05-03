def back_pane_clean_data(data):
	shape = data.shape
	result = data.tolist()
	return {"shape": shape, "data": result}


def prob_label_clean_data(data):
	result = data[:]
	for d in result:
		d[1] = 1 if d[1] else 0
	return result


clean_data_functions = {
	"backDrawImage": back_pane_clean_data,
	"probLabel": prob_label_clean_data,
}
