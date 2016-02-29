using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class Aquarium : MonoBehaviour {

	public Color dirty;
	public Color clean;

	private Renderer rend;
	private Slider sld;

	void Start () {
		rend = GetComponentInChildren<Renderer>();
		sld = GetComponentInChildren<Slider>();
	}
	
	// Update is called once per frame
	void Update () {
		rend.material.SetColor("_Color" ,Color.Lerp(clean, dirty, sld.value));
	}
}
