using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;

public class Clock : MonoBehaviour {

	private Text clock;

	void Start () {
		clock = GetComponentInChildren<Text>();
	}
	
	// Update is called once per frame
	void Update () {
		String sig;
		DateTime time = System.DateTime.Now;
		if(time.Hour >= 12){
			sig = "pm";
		}else{
			sig = "am";
		}
		clock.text = time.ToString("hh:mm")+sig;
		//Debug.Log(time.ToString("hh:mm"));
	}
}
